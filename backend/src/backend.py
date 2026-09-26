"""
Hrundel Kanban — Flask backend (stub endpoints).

Все маршруты возвращают хардкодные данные.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager

app = Flask(__name__)

# Разрешаем CORS для фронтенда на localhost (Vite dev-server).
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/hrundeldb",
)
pool = SimpleConnectionPool(1, 10, dsn=DATABASE_URL)

@contextmanager
def db():
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback() # роллбэк при исключении
        raise
    finally:
        pool.putconn(conn)

def query_one(sql, params=()):
    with db() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params)
        return cur.fetchone()

def query_all(sql, params=()):
    with db() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params)
        return cur.fetchall()

def execute(sql, params=(), returning=False):
    with db() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params)
        return cur.fetchone() if returning else None

def get_current_user_id():
    """
    Заглушка. Токен формата 'fake-token-<name>-123'.
    TODO: Auth — заменить на разбор JWT/session и SELECT id FROM users WHERE ...
    """
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    if token.startswith("fake-token-"):
        name = token[len("fake-token-"):].rsplit("-", 1)[0]
        row = query_one("SELECT id FROM users WHERE name = %s", (name,))
        if row:
            return row["id"]

    row = query_one("SELECT id FROM users LIMIT 1")
    return row["id"] if row else None

def user_owns_board(user_id, board_id):
    row = query_one(
        """
        SELECT 1 FROM board_members
        WHERE board_id = %s AND user_id = %s
          AND user_role IN ('owner','admin','member')
        """,
        (board_id, user_id),
    )
    return row is not None

# ---------------------------------------------------------------------------
# Вспомогательные функции
# ---------------------------------------------------------------------------

def ok(data=None, **kwargs):
    """Стандартный успешный ответ."""
    payload = {"status": "ok", "data": data or {}}
    payload.update(kwargs)
    return jsonify(payload), 200


def err(message: str, code: int = 400):
    """Стандартный ответ об ошибке."""
    return jsonify({"status": "error", "data": None, "message": message}), code


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

# @app.route("/api/login", methods=["POST"])
# def login():
#     body = request.get_json(silent=True) or {}
#     login_val = body.get("login", "").strip()
#     password = body.get("password", "").strip()
#
#     if not login_val or not password:
#         return err("Заполните все поля")
#
#     # TODO: DB — проверить пользователя в базе данных (SELECT WHERE login=login_val)
#     # TODO: DB — сравнить хэш пароля (bcrypt.check_password_hash)
#
#     # Stub: принимаем любой логин/пароль
#     fake_token = f"fake-token-{login_val}-123"
#     return jsonify({
#         "status": "ok",
#         "data": {"auth_token": fake_token}
#     }), 200


# @app.route("/api/register", methods=["POST"])
# def register():
#     body = request.get_json(silent=True) or {}
#     login_val = body.get("login", "").strip()
#     password = body.get("password", "").strip()
#     full_name = body.get("fullName", "").strip()
#
#     if not login_val or not password or not full_name:
#         return err("Заполните все поля")
#
#     if len(password) < 4:
#         return err("Пароль должен быть не менее 4 символов")
#
#     # TODO: DB — проверить что логин не занят (SELECT WHERE login=login_val)
#     # TODO: DB — создать пользователя (INSERT INTO users ...)
#     # TODO: DB — захешировать пароль перед сохранением (bcrypt.generate_password_hash)
#
#     return jsonify({"status": "ok", "data": {}}), 201


from werkzeug.security import generate_password_hash, check_password_hash

@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    name = (body.get("login") or "").strip()
    password = (body.get("password") or "").strip()
    if not name or not password:
        return err("Заполните все поля")

    user = query_one("SELECT id, password_hash FROM users WHERE name = %s", (name,))
    if not user or not check_password_hash(user["password_hash"], password):
        return err("Неверный логин или пароль", 401)

    return jsonify({"status": "ok", "data": {"auth_token": f"fake-token-{name}-123"}}), 200


@app.route("/api/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    name = (body.get("login") or "").strip()
    password = (body.get("password") or "").strip()
    full_name = (body.get("fullName") or "").strip() or name
    if not name or not password:
        return err("Заполните все поля")
    if len(password) < 4:
        return err("Пароль должен быть не менее 4 символов")

    if query_one("SELECT 1 FROM users WHERE name = %s", (name,)):
        return err("Логин уже занят", 409)

    row = execute(
        "INSERT INTO users (name, password_hash) VALUES (%s, %s) RETURNING id",
        (name, generate_password_hash(password)),
        returning=True,
    )
    return jsonify({"status": "ok", "data": {"id": row["id"]}}), 201

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    # TODO: DB — инвалидировать токен сессии, если используется серверный список сессий

    return ok()


# ---------------------------------------------------------------------------
# Boards
# ---------------------------------------------------------------------------

# Stub-данные для доски. Заменить на запрос к БД.
# TODO: DB — SELECT boards + columns + cards WHERE user_id = current_user
MOCK_BOARDS = [
    {
        "id": "1",
        "title": "Main Board",
        "columns": [
            {
                "id": "todo",
                "title": "To Do",
                "cards": [
                    {"id": "c1", "title": "Изучить Flask", "description": "Разобраться с маршрутами и Blueprint"},
                    {"id": "c2", "title": "Настроить БД", "description": "PostgreSQL + SQLAlchemy"},
                    {"id": "c3", "title": "Написать тесты", "description": "pytest + coverage"},
                ],
            },
            {
                "id": "in-progress",
                "title": "In Progress",
                "cards": [
                    {"id": "c4", "title": "Подключить фронтенд", "description": "React + Vite proxy → Flask"},
                    {"id": "c5", "title": "Реализовать CORS", "description": "flask_cors настройка"},
                ],
            },
            {
                "id": "done",
                "title": "Done",
                "cards": [
                    {"id": "c6", "title": "Инициализировать проект", "description": "pnpm workspace"},
                    {"id": "c7", "title": "Stub endpoints", "description": "Все маршруты отвечают без 404"},
                ],
            },
        ],
    }
]


# @app.route("/api/boards", methods=["GET"])
# def get_boards():
#     # TODO: DB — загрузить доски текущего пользователя из БД
#     # TODO: Auth — извлечь user_id из Bearer-токена в заголовке Authorization
#
#     return jsonify({
#         "status": "ok",
#         "data": {"boards": MOCK_BOARDS}
#     }), 200


@app.route("/api/boards", methods=["GET"])
def get_boards():
    user_id = get_current_user_id()
    if not user_id:
        return err("Не авторизован", 401)

    boards = query_all(
        """
        SELECT b.id, b.title
        FROM boards b
                 JOIN board_members bm ON bm.board_id = b.id
        WHERE bm.user_id = %s
        ORDER BY b.created_at
        """,
        (user_id,),
    )
    for b in boards:
        b["id"] = str(b["id"])
        cols = query_all(
            "SELECT id, title, position FROM board_columns WHERE board_id = %s ORDER BY position, id",
            (b["id"],),
        )
        for c in cols:
            c["id"] = str(c["id"])
            cards = query_all(
                """
                SELECT id, title, description, position
                FROM cards WHERE column_id = %s
                ORDER BY position, id
                """,
                (c["id"],),
            )
            for card in cards:
                card["id"] = str(card["id"])
            c["cards"] = cards
        b["columns"] = cols

    return jsonify({"status": "ok", "data": {"boards": boards}}), 200

@app.route("/api/boards", methods=["POST"])
def create_board():
    user_id = get_current_user_id()
    if not user_id:
        return err("Не авторизован", 401)

    body = request.get_json(silent=True)
    if not body:
        return err("Некорректный JSON")
    title = (body.get("name") or "").strip()
    if not title:
        return err("Укажите название доски")

    with db() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "INSERT INTO boards (owner_id, title) VALUES (%s, %s) RETURNING id, title",
            (user_id, title),
        )
        board = cur.fetchone()
        cur.execute(
            "INSERT INTO board_members (board_id, user_id, user_role) VALUES (%s, %s, 'owner')",
            (board["id"], user_id),
        )

    return jsonify({"status": "ok", "data": {"board": {
        "id": str(board["id"]),
        "title": board["title"],
        "columns": [],
    }}}), 201

@app.route("/api/boards/<int:board_id>", methods=["DELETE"])
def delete_board(board_id: int):
    user_id = get_current_user_id()
    if not user_id:
        return err("Не авторизован", 401)

    row = execute(
        "DELETE FROM boards WHERE id = %s AND owner_id = %s RETURNING id",
        (board_id, user_id),
        returning=True,
    )
    if not row:
        return err("Доска не найдена или нет прав", 404)
    return ok({"deleted": board_id})

# @app.route("/api/boards/<int:board_id>/cards", methods=["PATCH"])
# def move_card(board_id: int):
#     body = request.get_json(silent=True) or {}
#     card_id = body.get("cardId")
#     target_column_id = body.get("targetColumnId")
#
#     if not card_id or not target_column_id:
#         return err("Не указан cardId или targetColumnId")
#
#     # TODO: DB — обновить column_id у карточки (UPDATE cards SET column_id=target_column_id WHERE id=card_id)
#     # TODO: Auth — проверить что пользователь владеет этой доской
#
#     return ok({"cardId": card_id, "targetColumnId": target_column_id})

# @app.route("/api/boards", methods=["POST"])
# def create_board():
#     body = request.get_json()
#
#     if not body:
#         return err("Некорректный JSON")
#
#     name = body.get("name", "").strip()
#
#     if not name:
#         return err("Укажите название доски")
#
#     new_id = str(len(MOCK_BOARDS) + 1)
#
#     new_board = {
#         "id": new_id,
#         "title": name,
#         "columns": []
#     }
#
#     MOCK_BOARDS.append(new_board)
#
#     return jsonify({"status": "ok", "data": {"board": new_board}}), 201

# @app.route("/api/boards/<board_id>/columns", methods=["POST"])
# def create_column(board_id: str):
#     body = request.get_json()
#     if not body:
#         return err("Некорректный JSON")
#
#     title = body.get("title", "").strip()
#     if not title:
#         return err("Укажите название колонки")
#
#     board = next((b for b in MOCK_BOARDS if b["id"] == board_id), None)
#     if not board:
#         return err("Доска не найдена", 404)
#
#     new_id = f"col-{len(board['columns']) + 1}"
#     new_column = {
#         "id": new_id,
#         "title": title,
#         "cards": []
#     }
#
#     board["columns"].append(new_column)
#
#     return jsonify({"status": "ok", "data": {"column": new_column}}), 201

@app.route("/api/boards/<int:board_id>/columns", methods=["POST"])
def create_column(board_id: int):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    if not title:
        return err("Укажите название колонки")

    # row = execute(
    #     """
    #     INSERT INTO board_columns (board_id, title, position)
    #     VALUES (
    #                %s, %s,
    #                COALESCE((SELECT MAX(position) + 1 FROM board_columns WHERE board_id = %s), 0)
    #            )
    #         RETURNING id, title, position
    #     """,
    #     (board_id, title, board_id),
    #     returning=True,
    # )

    row = execute(
        """
        INSERT INTO board_columns (board_id, title, position)
        VALUES (
                   %s, %s,
                   COALESCE((SELECT MAX(position) + 1 FROM board_columns WHERE board_id = %s), 0)
               )
            RETURNING id, title, position
        """,
        (board_id, title, board_id),   # ← порядок: board_id, title, board_id
        returning=True,
    )


    return jsonify({"status": "ok", "data": {"column": {
        "id": str(row["id"]),
        "title": row["title"],
        "cards": [],
    }}}), 201

# @app.route("/api/boards/<board_id>/columns/<column_id>", methods=["DELETE"])
# def delete_column(board_id: str, column_id: str):
#     # Ищем доску
#     board = next((b for b in MOCK_BOARDS if b["id"] == board_id), None)
#     if not board:
#         return err("Доска не найдена", 404)
#
#     # Ищем колонку
#     column_index = next((i for i, c in enumerate(board["columns"]) if c["id"] == column_id), None)
#     if column_index is None:
#         return err("Колонка не найдена", 404)
#
#     # Удаляем колонку
#     board["columns"].pop(column_index)
#
#     return jsonify({"status": "ok", "data": {"deleted": column_id}}), 200

@app.route("/api/boards/<int:board_id>/columns/<int:column_id>", methods=["DELETE"])
def delete_column(board_id: int, column_id: int):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    row = execute(
        "DELETE FROM board_columns WHERE id = %s AND board_id = %s RETURNING id",
        (column_id, board_id),
        returning=True,
    )
    if not row:
        return err("Колонка не найдена", 404)
    return ok({"deleted": column_id})

@app.route("/api/boards/<int:board_id>/columns/<int:column_id>/cards", methods=["POST"])
def create_card(board_id: int, column_id: int):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    description = (body.get("description") or "").strip() or None
    if not title:
        return err("Укажите заголовок карточки")

    try:
        row = execute(
            """
            INSERT INTO cards (board_id, column_id, title, description, position)
            VALUES (
                       %s, %s, %s, %s,
                       COALESCE((SELECT MAX(position) + 1 FROM cards WHERE column_id = %s), 0)
                   )
                RETURNING id, title, description, position, column_id
            """,
            (board_id, column_id, title, description, column_id),
            returning=True,
        )
    except psycopg2.errors.ForeignKeyViolation:
        return err("Колонка не принадлежит этой доске", 400)

    return jsonify({"status": "ok", "data": {"card": {
        "id": str(row["id"]),
        "title": row["title"],
        "description": row["description"] or "",
        "columnId": str(row["column_id"]),
    }}}), 201

@app.route("/api/boards/<int:board_id>/cards/<int:card_id>", methods=["DELETE"])
def delete_card(board_id: int, card_id: int):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    row = execute(
        "DELETE FROM cards WHERE id = %s AND board_id = %s RETURNING id",
        (card_id, board_id),
        returning=True,
    )
    if not row:
        return err("Карточка не найдена", 404)
    return ok({"deleted": card_id})

@app.route("/api/boards/<int:board_id>/cards", methods=["PATCH"])
def move_card(board_id: int):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    body = request.get_json(silent=True) or {}
    card_id = body.get("cardId")
    target_column_id = body.get("targetColumnId")
    if not card_id or not target_column_id:
        return err("Не указан cardId или targetColumnId")

    try:
        row = execute(
            """
            UPDATE cards
            SET column_id = %s,
                position  = COALESCE(
                        (SELECT MAX(position) + 1 FROM cards WHERE column_id = %s), 0
                            ),
                updated_at = now()
            WHERE id = %s AND board_id = %s
                RETURNING id, column_id, position
            """,
            (target_column_id, target_column_id, card_id, board_id),
            returning=True,
        )
    except psycopg2.errors.ForeignKeyViolation:
        return err("Целевая колонка не принадлежит этой доске", 400)

    if not row:
        return err("Карточка не найдена", 404)
    return ok({"cardId": row["id"], "targetColumnId": row["column_id"]})

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
