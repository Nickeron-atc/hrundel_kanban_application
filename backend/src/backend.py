from flask import Flask, request, jsonify, g, send_file
from werkzeug.security import check_password_hash
from io import BytesIO
from config import Config
from extensions import db, cors
from models import User, Board, Column, Card, Tag, CardTag
from auth import generate_token, jwt_required


def err(message, code=400):
    return jsonify({"status": "error", "data": None, "message": message}), code


def serialize_tag(tag):
    return {"id": str(tag.id), "name": tag.name, "color": tag.color}


def serialize_card(card):
    return {
        "id": str(card.id),
        "title": card.title,
        "description": card.description or "",
        "color": card.color or "",
        "tags": [serialize_tag(t) for t in card.tags],
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
    return Board.query.filter_by(id=board_id, user_id=user_id).first() is not None


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app)

    with app.app_context():
        db.create_all()

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

    @app.route("/api/boards", methods=["GET"])
    @jwt_required
    def get_boards():
        boards = Board.query.filter_by(user_id=g.current_user.id).all()
        return jsonify({
            "status": "ok",
            "data": {"boards": [serialize_board(b) for b in boards]},
        })

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

        board = Board.query.get(board_id)
        return jsonify({
            "status": "ok",
            "data": {"board": serialize_board(board)},
        }), 201

    @app.route("/api/columns/<int:column_id>", methods=["DELETE"])
    @jwt_required
    def delete_column(column_id):
        col = Column.query.get(column_id)
        if not col or not user_owns_board(g.current_user.id, col.board_id):
            return err("Колонка не найдена", 404)

        board_id = col.board_id
        db.session.delete(col)
        db.session.commit()

        board = Board.query.get(board_id)
        return jsonify({
            "status": "ok",
            "data": {"board": serialize_board(board)},
        })

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
            tags = Tag.query.filter(
                Tag.id.in_(body["tagIds"]),
                Tag.board_id == board_id,
            ).all()
            card.tags = tags

        db.session.commit()
        return jsonify({
            "status": "ok",
            "data": {"card": serialize_card(card)},
        })

    @app.route("/api/cards/<int:card_id>", methods=["DELETE"])
    @jwt_required
    def delete_card(card_id):
        card = Card.query.get(card_id)
        if not card or not user_owns_board(g.current_user.id, card.column.board_id):
            return err("Карточка не найдена", 404)

        db.session.delete(card)
        db.session.commit()
        return jsonify({"status": "ok"})

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
        return jsonify({"status": "ok", "data": {"cardId": card_id, "targetColumnId": target_column_id}})

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
        user = User.query.get(user_id)
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

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)

