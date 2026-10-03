"""
Hrundel Kanban — Flask backend (In-Memory stub).
Все маршруты работают с локальным хранилищем в памяти (IN_MEMORY_DB).
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

app = Flask(__name__)

# Разрешаем CORS для фронтенда на localhost (Vite dev-server).
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ---------------------------------------------------------------------------
# IN-Memory Хранилище (вместо PostgreSQL)
# ---------------------------------------------------------------------------
IN_MEMORY_DB = {
    "users": [],    # {"id": "1", "name": "admin", "password_hash": "...", "full_name": "Admin"}
    "boards": [],   # {"id": "1", "title": "Main Board", "owner_id": "1", "members": ["1"]}
    "columns": [],  # {"id": "c1", "board_id": "1", "title": "To Do", "position": 0}
    "cards": []     # {"id": "card1", "column_id": "c1", "board_id": "1", "title": "...", "description": "...", "position": 0}
}

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

def get_current_user_id():
    """
    Извлекает ID пользователя из fake-токена.
    Формат токена: 'fake-token-<name>-123'
    """
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    
    if token.startswith("fake-token-"):
        name = token[len("fake-token-"):].rsplit("-", 1)[0]
        for user in IN_MEMORY_DB["users"]:
            if user["name"] == name:
                return user["id"]

    # Заглушка: если токен не распознан, возвращаем первого пользователя для тестов
    return IN_MEMORY_DB["users"][0]["id"] if IN_MEMORY_DB["users"] else None

def user_owns_board(user_id, board_id):
    """Проверяет, есть ли пользователь в списке участников доски."""
    board_id_str = str(board_id)
    for board in IN_MEMORY_DB["boards"]:
        if str(board["id"]) == board_id_str and user_id in board.get("members", []):
            return True
    return False

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    name = (body.get("login") or "").strip()
    password = (body.get("password") or "").strip()
    if not name or not password:
        return err("Заполните все поля")

    user = next((u for u in IN_MEMORY_DB["users"] if u["name"] == name), None)
    
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

    if any(u["name"] == name for u in IN_MEMORY_DB["users"]):
        return err("Логин уже занят", 409)

    new_user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "password_hash": generate_password_hash(password),
        "full_name": full_name
    }
    IN_MEMORY_DB["users"].append(new_user)

    return jsonify({"status": "ok", "data": {"id": new_user["id"]}}), 201

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    return ok()

# ---------------------------------------------------------------------------
# Boards (In-Memory Implementation)
# ---------------------------------------------------------------------------

@app.route("/api/boards", methods=["GET"])
def get_boards():
    user_id = get_current_user_id()
    if not user_id:
        return err("Не авторизован", 401)

    user_boards = [b for b in IN_MEMORY_DB["boards"] if user_id in b.get("members", [])]
    
    result_boards = []
    for b in user_boards:
        board_data = {
            "id": str(b["id"]),
            "title": b["title"],
            "columns": []
        }
        board_columns = [c for c in IN_MEMORY_DB["columns"] if str(c["board_id"]) == str(b["id"])]
        for c in sorted(board_columns, key=lambda x: x.get("position", 0)):
            col_data = {
                "id": str(c["id"]),
                "title": c["title"],
                "cards": []
            }
            col_cards = [card for card in IN_MEMORY_DB["cards"] if str(card["column_id"]) == str(c["id"])]
            for card in sorted(col_cards, key=lambda x: x.get("position", 0)):
                col_data["cards"].append({
                    "id": str(card["id"]),
                    "title": card["title"],
                    "description": card.get("description", ""),
                    "columnId": str(card["column_id"])
                })
            board_data["columns"].append(col_data)
        result_boards.append(board_data)

    return jsonify({"status": "ok", "data": {"boards": result_boards}}), 200

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

    new_board_id = str(uuid.uuid4())
    new_board = {
        "id": new_board_id,
        "title": title,
        "owner_id": user_id,
        "members": [user_id]
    }
    IN_MEMORY_DB["boards"].append(new_board)

    return jsonify({"status": "ok", "data": {"board": {
        "id": new_board_id,
        "title": title,
        "columns": [],
    }}}), 201

@app.route("/api/boards/<board_id>", methods=["DELETE"])
def delete_board(board_id: str):
    user_id = get_current_user_id()
    if not user_id:
        return err("Не авторизован", 401)

    board_idx = next((i for i, b in enumerate(IN_MEMORY_DB["boards"]) if str(b["id"]) == str(board_id) and b.get("owner_id") == user_id), None)
    
    if board_idx is None:
        return err("Доска не найдена или нет прав", 404)
    
    # Каскадное удаление
    IN_MEMORY_DB["boards"].pop(board_idx)
    IN_MEMORY_DB["columns"] = [c for c in IN_MEMORY_DB["columns"] if str(c["board_id"]) != str(board_id)]
    IN_MEMORY_DB["cards"] = [card for card in IN_MEMORY_DB["cards"] if str(card["board_id"]) != str(board_id)]

    return ok({"deleted": board_id})

@app.route("/api/boards/<board_id>/columns", methods=["POST"])
def create_column(board_id: str):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    if not title:
        return err("Укажите название колонки")

    board_columns = [c for c in IN_MEMORY_DB["columns"] if str(c["board_id"]) == str(board_id)]
    max_pos = max((c.get("position", 0) for c in board_columns), default=-1)
    new_pos = max_pos + 1

    new_column_id = str(uuid.uuid4())
    new_column = {
        "id": new_column_id,
        "board_id": str(board_id),
        "title": title,
        "position": new_pos
    }
    IN_MEMORY_DB["columns"].append(new_column)

    return jsonify({"status": "ok", "data": {"column": {
        "id": new_column_id,
        "title": title,
        "cards": [],
    }}}), 201

@app.route("/api/boards/<board_id>/columns/<column_id>", methods=["DELETE"])
def delete_column(board_id: str, column_id: str):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    col_idx = next((i for i, c in enumerate(IN_MEMORY_DB["columns"]) if str(c["id"]) == str(column_id) and str(c["board_id"]) == str(board_id)), None)
    
    if col_idx is None:
        return err("Колонка не найдена", 404)
    
    # Каскадное удаление карточек колонки
    IN_MEMORY_DB["columns"].pop(col_idx)
    IN_MEMORY_DB["cards"] = [card for card in IN_MEMORY_DB["cards"] if str(card["column_id"]) != str(column_id)]

    return ok({"deleted": column_id})

@app.route("/api/boards/<board_id>/columns/<column_id>/cards", methods=["POST"])
def create_card(board_id: str, column_id: str):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    col = next((c for c in IN_MEMORY_DB["columns"] if str(c["id"]) == str(column_id) and str(c["board_id"]) == str(board_id)), None)
    if not col:
        return err("Колонка не принадлежит этой доске", 400)

    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    description = (body.get("description") or "").strip() or None
    if not title:
        return err("Укажите заголовок карточки")

    col_cards = [card for card in IN_MEMORY_DB["cards"] if str(card["column_id"]) == str(column_id)]
    max_pos = max((card.get("position", 0) for card in col_cards), default=-1)
    new_pos = max_pos + 1

    new_card_id = str(uuid.uuid4())
    new_card = {
        "id": new_card_id,
        "board_id": str(board_id),
        "column_id": str(column_id),
        "title": title,
        "description": description,
        "position": new_pos
    }
    IN_MEMORY_DB["cards"].append(new_card)

    return jsonify({"status": "ok", "data": {"card": {
        "id": new_card_id,
        "title": title,
        "description": description or "",
        "columnId": str(column_id),
    }}}), 201

@app.route("/api/boards/<board_id>/cards/<card_id>", methods=["DELETE"])
def delete_card(board_id: str, card_id: str):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    card_idx = next((i for i, card in enumerate(IN_MEMORY_DB["cards"]) if str(card["id"]) == str(card_id) and str(card["board_id"]) == str(board_id)), None)
    
    if card_idx is None:
        return err("Карточка не найдена", 404)
    
    IN_MEMORY_DB["cards"].pop(card_idx)
    return ok({"deleted": card_id})

@app.route("/api/boards/<board_id>/cards", methods=["PATCH"])
def move_card(board_id: str):
    user_id = get_current_user_id()
    if not user_id or not user_owns_board(user_id, board_id):
        return err("Доска не найдена или нет прав", 404)

    body = request.get_json(silent=True) or {}
    card_id = body.get("cardId")
    target_column_id = body.get("targetColumnId")
    
    if not card_id or not target_column_id:
        return err("Не указан cardId или targetColumnId")

    target_col = next((c for c in IN_MEMORY_DB["columns"] if str(c["id"]) == str(target_column_id) and str(c["board_id"]) == str(board_id)), None)
    if not target_col:
        return err("Целевая колонка не принадлежит этой доске", 400)

    card_idx = next((i for i, card in enumerate(IN_MEMORY_DB["cards"]) if str(card["id"]) == str(card_id) and str(card["board_id"]) == str(board_id)), None)
    if card_idx is None:
        return err("Карточка не найдена", 404)

    col_cards = [card for card in IN_MEMORY_DB["cards"] if str(card["column_id"]) == str(target_column_id) and str(card["id"]) != str(card_id)]
    max_pos = max((card.get("position", 0) for card in col_cards), default=-1)
    
    IN_MEMORY_DB["cards"][card_idx]["column_id"] = str(target_column_id)
    IN_MEMORY_DB["cards"][card_idx]["position"] = max_pos + 1

    return ok({"cardId": card_id, "targetColumnId": target_column_id})

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)