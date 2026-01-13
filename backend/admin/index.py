import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для админ-панели: управление привилегиями пользователей'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Steam-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    admin_steam_id = event.get('headers', {}).get('X-Admin-Steam-Id') or event.get('headers', {}).get('x-admin-steam-id')
    
    if not admin_steam_id:
        return create_response(401, {'error': 'Admin authentication required'})
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute('SELECT is_admin FROM users WHERE steam_id = %s', (admin_steam_id,))
        admin_check = cur.fetchone()
        
        if not admin_check or not admin_check[0]:
            cur.close()
            conn.close()
            return create_response(403, {'error': 'Access denied. Admin privileges required.'})
        
        if method == 'GET' and '/requests' in event.get('path', ''):
            cur.execute('''
                SELECT pr.id, pr.privilege_type, pr.duration_type, pr.price, 
                       pr.payment_proof, pr.status, pr.created_at,
                       u.id, u.steam_id, u.steam_name, u.steam_avatar
                FROM purchase_requests pr
                JOIN users u ON pr.user_id = u.id
                WHERE pr.status = 'pending'
                ORDER BY pr.created_at DESC
            ''')
            
            requests = []
            for row in cur.fetchall():
                requests.append({
                    'id': row[0],
                    'privilege_type': row[1],
                    'duration_type': row[2],
                    'price': row[3],
                    'payment_proof': row[4],
                    'status': row[5],
                    'created_at': row[6].isoformat(),
                    'user': {
                        'id': row[7],
                        'steam_id': row[8],
                        'steam_name': row[9],
                        'steam_avatar': row[10]
                    }
                })
            
            cur.close()
            conn.close()
            return create_response(200, {'requests': requests})
        
        elif method == 'POST' and '/approve' in event.get('path', ''):
            body = json.loads(event.get('body', '{}'))
            request_id = body.get('request_id')
            
            if not request_id:
                cur.close()
                conn.close()
                return create_response(400, {'error': 'request_id is required'})
            
            cur.execute('''
                SELECT user_id, privilege_type, duration_type, price
                FROM purchase_requests WHERE id = %s AND status = 'pending'
            ''', (request_id,))
            
            req = cur.fetchone()
            if not req:
                cur.close()
                conn.close()
                return create_response(404, {'error': 'Request not found or already processed'})
            
            user_id, priv_type, duration_type, price = req
            
            expires_at = None
            if duration_type == '2weeks':
                expires_at = datetime.now() + timedelta(weeks=2)
            elif duration_type == '1month':
                expires_at = datetime.now() + timedelta(days=30)
            
            cur.execute('''
                INSERT INTO privileges (user_id, privilege_type, duration_type, price, expires_at, payment_confirmed)
                VALUES (%s, %s, %s, %s, %s, true)
                ON CONFLICT (user_id, privilege_type) 
                DO UPDATE SET 
                    duration_type = EXCLUDED.duration_type,
                    expires_at = EXCLUDED.expires_at,
                    activated_at = CURRENT_TIMESTAMP,
                    is_active = true,
                    payment_confirmed = true
            ''', (user_id, priv_type, duration_type, price, expires_at))
            
            cur.execute('''
                UPDATE purchase_requests 
                SET status = 'approved', processed_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (request_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return create_response(200, {'success': True, 'message': 'Privilege activated'})
        
        elif method == 'POST' and '/reject' in event.get('path', ''):
            body = json.loads(event.get('body', '{}'))
            request_id = body.get('request_id')
            
            if not request_id:
                cur.close()
                conn.close()
                return create_response(400, {'error': 'request_id is required'})
            
            cur.execute('''
                UPDATE purchase_requests 
                SET status = 'rejected', processed_at = CURRENT_TIMESTAMP
                WHERE id = %s AND status = 'pending'
            ''', (request_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return create_response(200, {'success': True, 'message': 'Request rejected'})
        
        elif method == 'GET' and '/users' in event.get('path', ''):
            cur.execute('''
                SELECT u.id, u.steam_id, u.steam_name, u.steam_avatar, u.created_at,
                       COUNT(p.id) as privilege_count
                FROM users u
                LEFT JOIN privileges p ON u.id = p.user_id AND p.is_active = true
                WHERE u.is_admin = false
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT 100
            ''')
            
            users = []
            for row in cur.fetchall():
                users.append({
                    'id': row[0],
                    'steam_id': row[1],
                    'steam_name': row[2],
                    'steam_avatar': row[3],
                    'created_at': row[4].isoformat(),
                    'privilege_count': row[5]
                })
            
            cur.close()
            conn.close()
            return create_response(200, {'users': users})
        
        else:
            cur.close()
            conn.close()
            return create_response(404, {'error': 'Endpoint not found'})
    
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        return create_response(500, {'error': str(e)})

def create_response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False
    }
