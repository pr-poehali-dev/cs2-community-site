-- Таблица пользователей с Steam ID
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    steam_id VARCHAR(64) UNIQUE NOT NULL,
    steam_name VARCHAR(255),
    steam_avatar VARCHAR(512),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица привилегий
CREATE TABLE IF NOT EXISTS privileges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    privilege_type VARCHAR(20) NOT NULL CHECK (privilege_type IN ('Low', 'Nice', 'Escape')),
    duration_type VARCHAR(20) NOT NULL CHECK (duration_type IN ('2weeks', '1month', 'forever')),
    price INTEGER NOT NULL,
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    payment_confirmed BOOLEAN DEFAULT false,
    payment_proof TEXT,
    UNIQUE(user_id, privilege_type)
);

-- Таблица заявок на покупку привилегий
CREATE TABLE IF NOT EXISTS purchase_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    privilege_type VARCHAR(20) NOT NULL,
    duration_type VARCHAR(20) NOT NULL,
    price INTEGER NOT NULL,
    payment_proof TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES users(id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_steam_id ON users(steam_id);
CREATE INDEX IF NOT EXISTS idx_privileges_user_id ON privileges(user_id);
CREATE INDEX IF NOT EXISTS idx_privileges_active ON privileges(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);

-- Вставка админа (замените steam_id на ваш настоящий Steam ID)
INSERT INTO users (steam_id, steam_name, is_admin) 
VALUES ('76561198000000000', 'Admin', true) 
ON CONFLICT (steam_id) DO NOTHING;