"""
Hrundel Kanban — Flask backend (stub endpoints).

Все маршруты возвращают хардкодные данные.
Места для подключения реальной БД и бизнес-логики отмечены комментарием: # TODO: DB
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Разрешаем CORS для фронтенда на localhost (Vite dev-server).
# В продакшене ограничь origins списком реальных доменов.
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    login_val = body.get("login", "").strip()
    password = body.get("password", "").strip()

    if not login_val or not password:
        return err("Заполните все поля")

    # TODO: DB — проверить пользователя в базе данных (SELECT WHERE login=login_val)
    # TODO: DB — сравнить хэш пароля (bcrypt.check_password_hash)

    # Stub: принимаем любой логин/пароль
    fake_token = f"fake-token-{login_val}-123"
    return jsonify({
        "status": "ok",
        "data": {"auth_token": fake_token}
    }), 200


@app.route("/api/register", methods=["POST"])
def register():
    body = request.get_json(silent=True) or {}
    login_val = body.get("login", "").strip()
    password = body.get("password", "").strip()
    full_name = body.get("fullName", "").strip()

    if not login_val or not password or not full_name:
        return err("Заполните все поля")

    if len(password) < 4:
        return err("Пароль должен быть не менее 4 символов")

    # TODO: DB — проверить что логин не занят (SELECT WHERE login=login_val)
    # TODO: DB — создать пользователя (INSERT INTO users ...)
    # TODO: DB — захешировать пароль перед сохранением (bcrypt.generate_password_hash)

    return jsonify({"status": "ok", "data": {}}), 201


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


@app.route("/api/boards", methods=["GET"])
def get_boards():
    # TODO: DB — загрузить доски текущего пользователя из БД
    # TODO: Auth — извлечь user_id из Bearer-токена в заголовке Authorization

    return jsonify({
        "status": "ok",
        "data": {"boards": MOCK_BOARDS}
    }), 200


@app.route("/api/boards/<int:board_id>/cards", methods=["PATCH"])
def move_card(board_id: int):
    body = request.get_json(silent=True) or {}
    card_id = body.get("cardId")
    target_column_id = body.get("targetColumnId")

    if not card_id or not target_column_id:
        return err("Не указан cardId или targetColumnId")

    # TODO: DB — обновить column_id у карточки (UPDATE cards SET column_id=target_column_id WHERE id=card_id)
    # TODO: Auth — проверить что пользователь владеет этой доской

    return ok({"cardId": card_id, "targetColumnId": target_column_id})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # debug=False чтобы не запускать reloader — он создаёт дочерний процесс
    # и ломает статус workflow-менеджера.
    # Для горячей перезагрузки используй: FLASK_DEBUG=1 flask run --reload
    # В продакшене: gunicorn -w 4 -b 0.0.0.0:5000 src.backend:app
    app.run(host="0.0.0.0", port=5000, debug=False)
