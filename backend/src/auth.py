import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app, g
from models import User

def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"status": "error", "message": "Токен отсутствует"}), 401

        try:
            payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.get(payload["user_id"])
            if not current_user:
                raise ValueError("Пользователь не найден")
            g.current_user = current_user
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Срок действия токена истек"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Невалидный токен"}), 401

        return f(*args, **kwargs)
    return decorated

