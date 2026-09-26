-- db/init.sql
CREATE TYPE board_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE users
(
    id            BIGSERIAL PRIMARY KEY,
    name          TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE boards
(
    id         BIGSERIAL PRIMARY KEY,
    owner_id   BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE board_members
(
    board_id  BIGINT     NOT NULL REFERENCES boards (id) ON DELETE CASCADE,
    user_id   BIGINT     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user_role board_role NOT NULL DEFAULT 'member',
    PRIMARY KEY (board_id, user_id)
);

CREATE TABLE board_columns
(
    id         BIGSERIAL PRIMARY KEY,
    board_id   BIGINT      NOT NULL REFERENCES boards (id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    position   INT         NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cards
(
    id          BIGSERIAL PRIMARY KEY,
    board_id    BIGINT      NOT NULL REFERENCES boards (id) ON DELETE CASCADE,
    column_id   BIGINT      NOT NULL REFERENCES board_columns (id) ON DELETE CASCADE,
    title       TEXT        NOT NULL,
    description TEXT,
    position    INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boards_owner ON boards (owner_id);
CREATE INDEX idx_board_members_user ON board_members (user_id);
CREATE INDEX idx_board_columns_board_pos ON board_columns (board_id, position);
CREATE INDEX idx_cards_column_pos ON cards (column_id, position);
CREATE INDEX idx_cards_board ON cards (board_id);

CREATE UNIQUE INDEX one_owner_per_board
    ON board_members(board_id)
    WHERE user_role = 'owner';

ALTER TABLE board_columns ADD UNIQUE (id, board_id);
ALTER TABLE cards
    ADD CONSTRAINT cards_column_board_fk
        FOREIGN KEY (column_id, board_id) REFERENCES board_columns(id, board_id);
