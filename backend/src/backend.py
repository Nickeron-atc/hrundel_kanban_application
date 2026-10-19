from flask import Flask, request, jsonify, g, send_file
from flask import send_from_directory
import os
from werkzeug.security import check_password_hash
from io import BytesIO
from config import Config
from extensions import db, cors
# backend/src/backend.py
from models import User, Board, Column, Card, Tag, CardTag, BoardMember
from auth import generate_token, jwt_required
import jwt
from functools import wraps


def err(message, code=400):
    return jsonify({"status": "error", "data": None, "message": message}), code


def serialize_tag(tag):
    return {"id": str(tag.id), "name": tag.name, "color": tag.color}


# def serialize_card(card):
#     return {
#         "id": str(card.id),
#         "title": card.title,
#         "description": card.description or "",
#         "color": card.color or "",
#         "tags": [serialize_tag(t) for t in card.tags],
#     }

# def serialize_card(card):
#     return {
#         "id": str(card.id),
#         "title": card.title,
#         "description": card.description or "",
#         "color": card.color or "",
#         "columnId": str(card.column_id),
#         "tags": [serialize_tag(t) for t in card.tags],
#     }

def serialize_card(card):
    creator_data = None
    if card.creator:
        avatar_url = ""
        if card.creator.avatar_data:
            import base64
            b64 = base64.b64encode(card.creator.avatar_data).decode('utf-8')
            avatar_url = f"data:{card.creator.avatar_mime_type or 'image/png'};base64,{b64}"
        creator_data = {
            "name": card.creator.full_name or card.creator.login,
            "avatarUrl": avatar_url
        }
    
    return {
        "id": card.id,
        "title": card.title,
        "description": card.description,
        "color": card.color,
        "columnId": card.column_id,
        "tags": [{"id": t.id, "name": t.name, "color": t.color} for t in card.tags],
        "creator": creator_data
    }


def serialize_column(col):
    return {
        "id": str(col.id),
        "title": col.title,
        "cards": [serialize_card(c) for c in col.cards],
    }


def serialize_board(board):
    return {
        "id": str(board.id),
        "title": board.title,
        "columns": [serialize_column(c) for c in board.columns],
    }

def user_owns_board(user_id, board_id):
    board = Board.query.get(board_id)
    if not board:
        return False
    if board.user_id == user_id:
        return True
    member = BoardMember.query.filter_by(board_id=board_id, user_id=user_id).first()
    return member is not None

def get_current_user_id():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload.get('user_id')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    @app.route("/api/register", methods=["POST"])
    def register():
        body = request.get_json(silent=True) or {}
        login_val = body.get("login", "").strip()
        password = body.get("password", "").strip()
        full_name = body.get("full_name", "").strip()

        if not login_val or not password:
            return err("Заполните все поля")

        if User.query.filter_by(login=login_val).first():
            return err("Пользователь уже существует", 409)

        user = User(login=login_val, full_name=full_name or None)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        token = generate_token(user.id)
        return jsonify({
            "status": "ok",
            "data": {"token": token, "user": user.to_dict()},
        }), 201

    @app.route("/api/login", methods=["POST"])
    def login():
        body = request.get_json(silent=True) or {}
        login_val = body.get("login", "").strip()
        password = body.get("password", "").strip()

        if not login_val or not password:
            return err("Заполните все поля")

        user = User.query.filter_by(login=login_val).first()
        if not user or not check_password_hash(user.password_hash, password):
            return err("Неверный логин или пароль", 401)

        token = generate_token(user.id)
        return jsonify({
            "status": "ok",
            "data": {"token": token, "user": user.to_dict()},
        })

    # @app.route("/api/boards", methods=["GET"])
    # @jwt_required
    # def get_boards():
    #     boards = Board.query.filter_by(user_id=g.current_user.id).all()
    #     return jsonify({
    #         "status": "ok",
    #         "data": {"boards": [serialize_board(b) for b in boards]},
    #     })

    @app.route("/api/boards", methods=["POST"])
    @jwt_required
    def create_board():
        body = request.get_json(silent=True) or {}
        title = body.get("title", "").strip()
        if not title:
            return err("Название доски обязательно")

        board = Board(title=title, user_id=g.current_user.id)
        db.session.add(board)
        db.session.commit()

        return jsonify({
            "status": "ok",
            "data": {"board": serialize_board(board)},
        }), 201

    @app.route("/api/boards/<int:board_id>", methods=["DELETE"])
    @jwt_required
    def delete_board(board_id):
        board = Board.query.get(board_id)
        if not board or board.user_id != g.current_user.id:
            return err("Доска не найдена", 404)

        db.session.delete(board)
        db.session.commit()
        return jsonify({"status": "ok"})

    # @app.route("/api/boards/<int:board_id>/columns", methods=["POST"])
    # @jwt_required
    # def create_column(board_id):
    #     if not user_owns_board(g.current_user.id, board_id):
    #         return err("Доска не найдена или нет прав", 404)

    #     body = request.get_json(silent=True) or {}
    #     title = body.get("title", "").strip()
    #     if not title:
    #         return err("Название колонки обязательно")

    #     col = Column(title=title, board_id=board_id)
    #     db.session.add(col)
    #     db.session.commit()

    #     board = Board.query.get(board_id)
    #     return jsonify({
    #         "status": "ok",
    #         "data": {"board": serialize_board(board)},
    #     }), 201

    @app.route("/api/boards/<int:board_id>/columns", methods=["POST"])
    @jwt_required
    def create_column(board_id):
        if not user_owns_board(g.current_user.id, board_id):
            return err("Доска не найдена или нет прав", 404)
        body = request.get_json(silent=True) or {}
        title = body.get("title", "").strip()
        if not title:
            return err("Название колонки обязательно")
        col = Column(title=title, board_id=board_id)
        db.session.add(col)
        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"column": serialize_column(col)},
        }), 201

    # @app.route("/api/columns/<int:column_id>", methods=["DELETE"])
    # @jwt_required
    # def delete_column(column_id):
    #     col = Column.query.get(column_id)
    #     if not col or not user_owns_board(g.current_user.id, col.board_id):
    #         return err("Колонка не найдена", 404)

    #     board_id = col.board_id
    #     db.session.delete(col)
    #     db.session.commit()

    #     board = Board.query.get(board_id)
    #     return jsonify({
    #         "status": "ok",
    #         "data": {"board": serialize_board(board)},
    #     })

    @app.route("/api/columns/<int:column_id>", methods=["DELETE"])
    @jwt_required
    def delete_column(column_id):
        col = Column.query.get(column_id)
        if not col:
            return err("Колонка не найдена", 404)
        if not user_owns_board(g.current_user.id, col.board_id):
            return err("Нет прав", 403)
        db.session.delete(col)
        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"deleted": str(column_id)},
        })

    # @app.route("/api/boards/<int:board_id>/columns/<int:column_id>/cards", methods=["POST"])
    # @jwt_required
    # def create_card(board_id, column_id):
    #     if not user_owns_board(g.current_user.id, board_id):
    #         return err("Доска не найдена или нет прав", 404)
    #     col = Column.query.filter_by(id=column_id, board_id=board_id).first()
    #     if not col:
    #         return err("Колонка не принадлежит этой доске", 400)

    #     data = request.get_json() or {}
    #     title = data.get("title", "").strip()
    #     description = data.get("description", "").strip()
    #     color = data.get("color", "")
    #     if not title:
    #         return err("Название карточки не может быть пустым", 400)

    #     row = execute(
    #         """
    #         INSERT INTO cards (column_id, title, description, color)
    #         VALUES (%s, %s, %s, %s)
    #         RETURNING id, column_id, title, description, color;
    #         """,
    #         (column_id, title, description, color),
    #         returning=True,
    #     )
        
    #     card_data = {
    #         "id": str(row["id"]),
    #         "title": row["title"],
    #         "description": row["description"] or "",
    #         "columnId": str(row["column_id"]),
    #         "color": row["color"] or "",
    #         "tags": []
    #     }
        
    #     return jsonify({
    #         "status": "ok",
    #         "data": {"card": card_data}
    #     }), 201

    # @app.route("/api/boards/<int:board_id>/columns/<int:column_id>/cards", methods=["POST"])
    # @jwt_required
    # def create_card(board_id, column_id):
    #     if not user_owns_board(g.current_user.id, board_id):
    #         return err("Доска не найдена или нет прав", 404)
    #     col = Column.query.filter_by(id=column_id, board_id=board_id).first()
    #     if not col:
    #         return err("Колонка не принадлежит этой доске", 400)
    #     body = request.get_json(silent=True) or {}
    #     title = body.get("title", "").strip()
    #     if not title:
    #         return err("Название карточки обязательно")
    #     card = Card(
    #         title=title,
    #         description=body.get("description", ""),
    #         color=body.get("color"),
    #         column_id=column_id,
    #     )
    #     db.session.add(card)
    #     db.session.commit()
    #     return jsonify({
    #         "status": "ok",
    #         "data": {"card": serialize_card(card)},
    #     }), 201

    @app.route("/api/boards/<int:board_id>/columns/<int:column_id>/cards", methods=["POST"])
    @jwt_required
    def create_card(board_id, column_id):
        if not user_owns_board(g.current_user.id, board_id):
            return err("Доска не найдена или нет прав", 404)
        col = Column.query.filter_by(id=column_id, board_id=board_id).first()
        if not col:
            return err("Колонка не принадлежит этой доске", 400)
        body = request.get_json(silent=True) or {}
        title = body.get("title", "").strip()
        if not title:
            return err("Название карточки обязательно")
        card = Card(
            title=title,
            description=body.get("description", ""),
            color=body.get("color"),
            column_id=column_id,
            creator_id=g.current_user.id,
        )
        db.session.add(card)
        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"card": serialize_card(card)},
        }), 201


    @app.route("/api/boards/<int:board_id>/cards/<int:card_id>", methods=["PATCH"])
    @jwt_required
    def update_card(board_id, card_id):
        if not user_owns_board(g.current_user.id, board_id):
            return err("Доска не найдена или нет прав", 404)

        card = Card.query.get(card_id)
        if not card or card.column.board_id != board_id:
            return err("Карточка не найдена", 404)

        body = request.get_json(silent=True) or {}

        if "title" in body:
            card.title = body["title"]
        if "description" in body:
            card.description = body["description"]
        if "color" in body:
            card.color = body["color"]
        if "tagIds" in body:
            valid_tag_ids = []
            for tid in body["tagIds"]:
                try:
                    int_tid = int(tid)
                    if 0 < int_tid <= 2147483647:
                        valid_tag_ids.append(int_tid)
                except (ValueError, TypeError):
                    pass
            
            if valid_tag_ids:
                tags = Tag.query.filter(
                    Tag.id.in_(valid_tag_ids),
                    Tag.board_id == board_id,
                ).all()
            else:
                tags = []
            card.tags = tags

        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"card": serialize_card(card)},
        })

    # @app.route("/api/cards/<int:card_id>", methods=["DELETE"])
    # @jwt_required
    # def delete_card(card_id):
    #     card = Card.query.get(card_id)
    #     if not card or not user_owns_board(g.current_user.id, card.column.board_id):
    #         return err("Карточка не найдена", 404)

    #     db.session.delete(card)
    #     db.session.commit()
    #     return jsonify({"status": "ok"})

    @app.route("/api/cards/<int:card_id>", methods=["DELETE"])
    @jwt_required
    def delete_card(card_id):
        card = Card.query.get(card_id)
        if not card or not user_owns_board(g.current_user.id, card.column.board_id):
            return err("Карточка не найдена", 404)
        db.session.delete(card)
        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"deleted": str(card_id)},
        })

    # @app.route("/api/cards/move", methods=["POST"])
    # @jwt_required
    # def move_card():
    #     body = request.get_json(silent=True) or {}
    #     card_id = body.get("card_id")
    #     target_column_id = body.get("target_column_id")
    #
    #     if not card_id or not target_column_id:
    #         return err("Необходимы card_id и target_column_id")
    #
    #     card = Card.query.get(card_id)
    #     target_col = Column.query.get(target_column_id)
    #
    #     if not card or not target_col:
    #         return err("Карточка или колонка не найдена", 404)
    #
    #     if not user_owns_board(g.current_user.id, target_col.board_id):
    #         return err("Нет прав", 403)
    #
    #     card.column_id = target_column_id
    #     db.session.commit()
    #
    #     return jsonify({"status": "ok"})



    # @app.route("/api/cards/move", methods=["POST"])
    # @jwt_required
    # def move_card():
    #     body = request.get_json(silent=True) or {}
    #     card_id = body.get("card_id")
    #     target_column_id = body.get("target_column_id")
    #     board_id = body.get("board_id")

    #     if not card_id or not target_column_id or not board_id:
    #         return err("Необходимы card_id, target_column_id и board_id")

    #     card = Card.query.get(card_id)
    #     target_col = Column.query.get(target_column_id)

    #     if not card or not target_col:
    #         return err("Карточка или колонка не найдена", 404)

    #     if not user_owns_board(g.current_user.id, target_col.board_id):
    #         return err("Нет прав", 403)

    #     card.column_id = target_column_id
    #     db.session.commit()
    #     # return jsonify({"status": "ok", "data": {"cardId": card_id, "targetColumnId": target_column_id}})
    #     # backend/src/backend.py
    #     # backend/src/backend.py
    #     return jsonify({
    #         "status": "ok",
    #         "data": {
    #             "card": serialize_card(card),
    #             "boardId": str(board.id),
    #         },
        # }), 200


    # @app.route("/api/cards/move", methods=["POST"])
    # @jwt_required
    # def move_card():
    #     body = request.get_json(silent=True) or {}
    #     card_id = body.get("card_id")
    #     target_column_id = body.get("target_column_id")
    #     board_id = body.get("board_id")

    #     if not card_id or not target_column_id or not board_id:
    #         return err("Необходимы card_id, target_column_id и board_id")

    #     card = Card.query.get(card_id)
    #     target_col = Column.query.get(target_column_id)

    #     if not card or not target_col:
    #         return err("Карточка или колонка не найдена", 404)

    #     if not user_owns_board(g.current_user.id, target_col.board_id):
    #         return err("Нет прав", 403)

    #     card.column_id = target_column_id
    #     db.session.commit()

    #     board = Board.query.get(target_col.board_id)

    #     return jsonify({
    #         "status": "ok",
    #         "data": {
    #             "card": serialize_card(card),
    #             "boardId": str(board.id),
    #         },
    #     }), 200


    @app.route("/api/cards/move", methods=["POST"])
    @jwt_required
    def move_card():
        body = request.get_json(silent=True) or {}
        card_id = body.get("card_id")
        target_column_id = body.get("target_column_id")
        board_id = body.get("board_id")
        if not card_id or not target_column_id or not board_id:
            return err("Необходимы card_id, target_column_id и board_id")
        card = Card.query.get(card_id)
        target_col = Column.query.get(target_column_id)
        if not card or not target_col:
            return err("Карточка или колонка не найдена", 404)
        if not user_owns_board(g.current_user.id, target_col.board_id):
            return err("Нет прав", 403)
        card.column_id = target_column_id
        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {
                "cardId": str(card_id),
                "targetColumnId": str(target_column_id),
            },
        })

    @app.route("/api/boards/<int:board_id>/tags", methods=["GET"])
    @jwt_required
    def get_tags(board_id):
        if not user_owns_board(g.current_user.id, board_id):
            return err("Доска не найдена", 404)

        tags = Tag.query.filter_by(board_id=board_id).all()
        return jsonify({
            "status": "ok",
            "data": {"tags": [serialize_tag(t) for t in tags]},
        })

    @app.route("/api/boards/<int:board_id>/tags", methods=["POST"])
    @jwt_required
    def create_tag(board_id):
        if not user_owns_board(g.current_user.id, board_id):
            return err("Доска не найдена", 404)

        body = request.get_json(silent=True) or {}
        name = body.get("name", "").strip()
        color = body.get("color", "#999999")

        if not name:
            return err("Название тега обязательно")

        if Tag.query.filter_by(name=name, board_id=board_id).first():
            return err("Тег с таким названием уже существует", 409)

        tag = Tag(name=name, color=color, board_id=board_id)
        db.session.add(tag)
        db.session.commit()

        return jsonify({
            "status": "ok",
            "data": {"tag": serialize_tag(tag)},
        }), 201

    @app.route("/api/tags/<int:tag_id>", methods=["DELETE"])
    @jwt_required
    def delete_tag(tag_id):
        tag = Tag.query.get(tag_id)
        if not tag or not user_owns_board(g.current_user.id, tag.board_id):
            return err("Тег не найден", 404)

        db.session.delete(tag)
        db.session.commit()
        return jsonify({"status": "ok"})

    @app.route("/api/users/<int:user_id>/avatar", methods=["POST"])
    @jwt_required
    def upload_avatar(user_id):
        if g.current_user.id != user_id:
            return err("Нет прав", 403)

        f = request.files.get("avatar")
        if not f:
            return err("Файл не найден")

        g.current_user.avatar_data = f.read()
        g.current_user.avatar_mime_type = f.mimetype
        db.session.commit()

        return jsonify({"ok": True})

    @app.route("/api/users/<int:user_id>/avatar", methods=["GET"])
    def get_avatar(user_id):
        # user = User.query.get(user_id)
        user = db.session.get(User, user_id)
        if not user or not user.avatar_data:
            return err("Аватар не найден", 404)

        return send_file(BytesIO(user.avatar_data), mimetype=user.avatar_mime_type)

    @app.route("/api/users/<int:user_id>/avatar", methods=["DELETE"])
    @jwt_required
    def delete_avatar(user_id):
        if g.current_user.id != user_id:
            return err("Нет прав", 403)

        g.current_user.avatar_data = None
        g.current_user.avatar_mime_type = None
        db.session.commit()
        return jsonify({"ok": True})

    @app.route("/api/me", methods=["GET"])
    @jwt_required
    def get_me():
        return jsonify({
            "status": "ok",
            "data": {"user": g.current_user.to_dict()},
        })

    @app.route("/api/users/<int:user_id>", methods=["PATCH"])
    @jwt_required
    def update_user(user_id):
        if g.current_user.id != user_id:
            return err("Нет прав", 403)
        body = request.get_json(silent=True) or {}
        if "full_name" in body:
            g.current_user.full_name = body["full_name"]
        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"user": g.current_user.to_dict()},
        })

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        return jsonify({"status": "ok", "data": {}}), 200


    @app.route("/api/boards/<int:board_id>/share", methods=["GET"])
    @jwt_required
    def get_share_link(board_id):
        if not user_owns_board(g.current_user.id, board_id):
            return err("Доска не найдена или нет прав", 404)
        
        board = Board.query.get(board_id)
        share_token = f"share_{board.id}_{board.user_id}"
        share_url = f"{request.host_url}join/{share_token}"
        
        return jsonify({
            "status": "ok",
            "data": {"share_url": share_url, "share_token": share_token}
        })

    @app.route("/api/boards/join", methods=["POST"])
    @jwt_required
    def join_board():
        body = request.get_json(silent=True) or {}
        share_token = body.get("share_token", "").strip()
        
        if not share_token or not share_token.startswith("share_"):
            return err("Невалидная ссылка", 400)
        
        parts = share_token.split("_")
        if len(parts) != 3:
            return err("Невалидная ссылка", 400)
        
        try:
            board_id = int(parts[1])
            owner_id = int(parts[2])
        except ValueError:
            return err("Невалидная ссылка", 400)
        
        board = Board.query.get(board_id)
        if not board or board.user_id != owner_id:
            return err("Доска не найдена", 404)
        
        if board.user_id == g.current_user.id:
            return err("Вы уже являетесь владельцем этой доски", 400)
        
        existing = BoardMember.query.filter_by(board_id=board_id, user_id=g.current_user.id).first()
        if existing:
            return err("Вы уже присоединились к этой доске", 400)
        
        member = BoardMember(board_id=board_id, user_id=g.current_user.id, role="member")
        db.session.add(member)
        db.session.commit()
        
        return jsonify({
            "status": "ok",
            "data": {"board": serialize_board(board)}
        })

    @app.route("/api/boards", methods=["GET"])
    @jwt_required
    def get_boards():
        owned_boards = Board.query.filter_by(user_id=g.current_user.id).all()
        member_board_ids = db.session.query(BoardMember.board_id).filter_by(user_id=g.current_user.id).all()
        member_board_ids = [b[0] for b in member_board_ids]
        shared_boards = Board.query.filter(Board.id.in_(member_board_ids)).all() if member_board_ids else []
        all_boards = owned_boards + shared_boards
        return jsonify({
            "status": "ok",
            "data": {"boards": [serialize_board(b) for b in all_boards]},
        })

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)

