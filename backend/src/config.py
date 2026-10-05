# backend/src/config.py
import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-production-key")

    # Изменено с kanban:kanban на postgres:postgres
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/hrundeldb"
    )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
