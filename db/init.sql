-- db/init.sql
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     login VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(120) NOT NULL,
    full_name VARCHAR(120)
    );

CREATE TABLE IF NOT EXISTS boards (
                                      id SERIAL PRIMARY KEY,
                                      title VARCHAR(120) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS columns (
                                       id SERIAL PRIMARY KEY,
                                       title VARCHAR(120) NOT NULL,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS cards (
                                     id SERIAL PRIMARY KEY,
                                     title VARCHAR(120) NOT NULL,
    description TEXT,
    column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE
    );
