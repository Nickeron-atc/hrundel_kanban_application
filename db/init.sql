-- db/init.sql - обновлённая схема

-- Таблица пользователей (без изменений)
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     login VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(120) NOT NULL,
    full_name VARCHAR(120)
    );

-- Таблица досок (без изменений)
CREATE TABLE IF NOT EXISTS boards (
                                      id SERIAL PRIMARY KEY,
                                      title VARCHAR(120) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );

-- Таблица колонок (без изменений)
CREATE TABLE IF NOT EXISTS columns (
                                       id SERIAL PRIMARY KEY,
                                       title VARCHAR(120) NOT NULL,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE
    );

-- Таблица карточек - ДОБАВЛЯЕМ поле color
CREATE TABLE IF NOT EXISTS cards (
                                     id SERIAL PRIMARY KEY,
                                     title VARCHAR(120) NOT NULL,
    description TEXT,
    column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
    color VARCHAR(7)  -- HEX цвет, например #FF7A00
    );

-- НОВАЯ таблица тегов
CREATE TABLE IF NOT EXISTS tags (
                                    id SERIAL PRIMARY KEY,
                                    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,  -- HEX цвет тега
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    UNIQUE(name, board_id)  -- имя тега уникально в рамках доски
    );

-- НОВАЯ связующая таблица для карточек и тегов
CREATE TABLE IF NOT EXISTS card_tags (
                                         card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, tag_id)
    );