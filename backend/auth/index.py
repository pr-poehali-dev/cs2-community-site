import json
import os
import psycopg2
from urllib.parse import parse_qs, urlparse
import re

def handler(event: dict, context) -> dict:
    '''API для Steam авторизации и управления сессиями пользователей'''
    
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'POST' and '/callback' in path:
            body = json.loads(event.get('body', '{}'))
            openid_response = body.get('openid_response', '')
            
            match = re.search(r'https://steamcommunity.com/openid/id/(\d+)', openid_response)
            if not match:
                return create_response(400, {'error': 'Invalid Steam OpenID response'})
            
            steam_id = match.group(1)
            
            steam_name = body.get('steam_name', f'Player_{steam_id[-4:]}')
            steam_avatar = body.get('steam_avatar', '')
            
            cur.execute('''
                INSERT INTO users (steam_id, steam_name, steam_avatar, last_login)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (steam_id) 
                DO UPDATE SET last_login = CURRENT_TIMESTAMP, 
                              steam_name = EXCLUDED.steam_name,
                              steam_avatar = EXCLUDED.steam_avatar
                RETURNING id, steam_id, steam_name, steam_avatar, is_admin
            ''', (steam_id, steam_name, steam_avatar))
            
            user = cur.fetchone()
            conn.commit()
            
            cur.execute('''
                SELECT privilege_type, expires_at, is_active 
                FROM privileges 
                WHERE user_id = %s AND is_active = true
            ''', (user[0],))
            
            privileges = [{'type': row[0], 'expires_at': row[1].isoformat() if row[1] else None} 
                         for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return create_response(200, {
                'user': {
                    'id': user[0],
                    'steam_id': user[1],
                    'steam_name': user[2],
                    'steam_avatar': user[3],
                    'is_admin': user[4]
                },
                'privileges': privileges
            })
        
        elif method == 'GET' and '/user/' in path:
            steam_id = path.split('/user/')[-1]
            
            cur.execute('''
                SELECT id, steam_id, steam_name, steam_avatar, is_admin
                FROM users WHERE steam_id = %s
            ''', (steam_id,))
            
            user = cur.fetchone()
            if not user:
                cur.close()
                conn.close()
                return create_response(404, {'error': 'User not found'})
            
            cur.execute('''
                SELECT privilege_type, expires_at, is_active, activated_at
                FROM privileges 
                WHERE user_id = %s AND is_active = true
            ''', (user[0],))
            
            privileges = [{'type': row[0], 'expires_at': row[1].isoformat() if row[1] else None, 
                          'activated_at': row[3].isoformat()} for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return create_response(200, {
                'user': {
                    'id': user[0],
                    'steam_id': user[1],
                    'steam_name': user[2],
                    'steam_avatar': user[3],
                    'is_admin': user[4]
                },
                'privileges': privileges
            })
        
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
