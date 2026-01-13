import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для создания заявок на покупку привилегий'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Steam-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return create_response(405, {'error': 'Method not allowed'})
    
    steam_id = event.get('headers', {}).get('X-Steam-Id') or event.get('headers', {}).get('x-steam-id')
    
    if not steam_id:
        return create_response(401, {'error': 'Steam authentication required'})
    
    body = json.loads(event.get('body', '{}'))
    privilege_type = body.get('privilege_type')
    duration_type = body.get('duration_type')
    payment_proof = body.get('payment_proof', '')
    
    if not privilege_type or not duration_type:
        return create_response(400, {'error': 'privilege_type and duration_type are required'})
    
    if privilege_type not in ['Low', 'Nice', 'Escape']:
        return create_response(400, {'error': 'Invalid privilege_type'})
    
    if duration_type not in ['2weeks', '1month', 'forever']:
        return create_response(400, {'error': 'Invalid duration_type'})
    
    price_map = {
        'Low': {'2weeks': 20, 'forever': 100},
        'Nice': {'1month': 100, 'forever': 300},
        'Escape': {'1month': 200, 'forever': 550}
    }
    
    price = price_map.get(privilege_type, {}).get(duration_type)
    if not price:
        return create_response(400, {'error': 'Invalid price combination'})
    
    dsn = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute('SELECT id FROM users WHERE steam_id = %s', (steam_id,))
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return create_response(404, {'error': 'User not found. Please login first.'})
        
        user_id = user[0]
        
        cur.execute('''
            INSERT INTO purchase_requests (user_id, privilege_type, duration_type, price, payment_proof)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, created_at
        ''', (user_id, privilege_type, duration_type, price, payment_proof))
        
        request = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return create_response(200, {
            'success': True,
            'request_id': request[0],
            'created_at': request[1].isoformat(),
            'message': 'Purchase request created. Admin will review it soon.'
        })
    
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
