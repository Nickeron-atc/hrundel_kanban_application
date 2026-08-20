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

CREATE INDEX idx_boards_owner ON boards (owner_id);
CREATE INDEX idx_board_members_user ON board_members (user_id);
CREATE INDEX idx_board_columns_board_pos ON board_columns (board_id, position);
CREATE INDEX idx_cards_column_pos ON cards (column_id, position);
CREATE INDEX idx_cards_board ON cards (board_id);

CREATE UNIQUE INDEX one_owner_per_board
    ON board_members (board_id)
    WHERE user_role = 'owner';

ALTER TABLE board_columns
    ADD UNIQUE (id, board_id);
ALTER TABLE cards
    ADD CONSTRAINT cards_column_board_fk
        FOREIGN KEY (column_id, board_id) REFERENCES board_columns (id, board_id);

