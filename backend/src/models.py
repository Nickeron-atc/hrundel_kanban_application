from extensions import db
from werkzeug.security import generate_password_hash

# class User(db.Model):
#     __tablename__ = "users"
#     id = db.Column(db.Integer, primary_key=True)
#     login = db.Column(db.String(80), unique=True, nullable=False)
#     password_hash = db.Column(db.String(120), nullable=False)
#     full_name = db.Column(db.String(120))
#     avatar_data = db.Column(db.LargeBinary)
#     avatar_mime_type = db.Column(db.String(50))

#     def set_password(self, password):
#         self.password_hash = generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "login": self.login,
#             "full_name": self.full_name,
#             "has_avatar": self.avatar_data is not None
#         }

# class Board(db.Model):
#     __tablename__ = "boards"
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(120), nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
#     columns = db.relationship("Column", backref="board", cascade="all, delete-orphan")

# class Column(db.Model):
#     __tablename__ = "columns"
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(120), nullable=False)
#     board_id = db.Column(db.Integer, db.ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
#     cards = db.relationship("Card", backref="column", cascade="all, delete-orphan", order_by="Card.id")

# # class Card(db.Model):
# #     __tablename__ = "cards"
# #     id = db.Column(db.Integer, primary_key=True)
# #     title = db.Column(db.String(120), nullable=False)
# #     description = db.Column(db.Text)
# #     color = db.Column(db.String(7))
# #     column_id = db.Column(db.Integer, db.ForeignKey("columns.id", ondelete="CASCADE"), nullable=False)
# #     tags = db.relationship("Tag", secondary="card_tags", backref="cards", lazy="subquery")

# class Card(db.Model):
#     __tablename__ = 'cards'
#     id = db.Column(db.Integer, primary_key=True)
#     title = db.Column(db.String(120), nullable=False)
#     description = db.Column(db.Text)
#     column_id = db.Column(db.Integer, db.ForeignKey('columns.id', ondelete='CASCADE'), nullable=False)
#     color = db.Column(db.String(7))
#     creator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
#     column = db.relationship('Column', backref=db.backref('cards', lazy=True, cascade='all, delete-orphan'))
#     creator = db.relationship('User', foreign_keys=[creator_id], lazy='joined')

# class Tag(db.Model):
#     __tablename__ = "tags"
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(50), nullable=False)
#     color = db.Column(db.String(7), nullable=False)
#     board_id = db.Column(db.Integer, db.ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)

# class CardTag(db.Model):
#     __tablename__ = "card_tags"
#     card_id = db.Column(db.Integer, db.ForeignKey("cards.id", ondelete="CASCADE"), primary_key=True)
    # tag_id = db.Column(db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)



# backend/src/backend/models.py

from extensions import db
from werkzeug.security import generate_password_hash

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    full_name = db.Column(db.String(120))
    avatar_data = db.Column(db.LargeBinary)
    avatar_mime_type = db.Column(db.String(50))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)

    def to_dict(self):
        return {
            "id": self.id,
            "login": self.login,
            "full_name": self.full_name,
            "has_avatar": self.avatar_data is not None
        }


class BoardMember(db.Model):
    __tablename__ = "board_members"
    id = db.Column(db.Integer, primary_key=True)
    board_id = db.Column(db.Integer, db.ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")
    joined_at = db.Column(db.DateTime, default=db.func.now())
    
    __table_args__ = (db.UniqueConstraint('board_id', 'user_id', name='unique_board_member'),)

class Board(db.Model):
    __tablename__ = "boards"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    columns = db.relationship("Column", backref="board", cascade="all, delete-orphan")

class Column(db.Model):
    __tablename__ = "columns"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    board_id = db.Column(db.Integer, db.ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    # backref="column" автоматически создаст атрибут .column в модели Card
    cards = db.relationship("Card", backref="column", cascade="all, delete-orphan", order_by="Card.id")


class Card(db.Model):
    __tablename__ = "cards"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7))
    column_id = db.Column(db.Integer, db.ForeignKey("columns.id", ondelete="CASCADE"), nullable=False)
    
    # ШАГ 2: Добавлено поле создателя
    creator_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # ШАГ 2: Отношение к User для получения данных создателя (lazy='joined' подгрузит его сразу)
    creator = db.relationship("User", foreign_keys=[creator_id], lazy="joined")
    
    # ВОССТАНОВЛЕНО: Связь с тегами через ассоциативную таблицу
    tags = db.relationship("Tag", secondary="card_tags", backref="cards", lazy="subquery")


class Tag(db.Model):
    __tablename__ = "tags"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(7), nullable=False)
    board_id = db.Column(db.Integer, db.ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)


class CardTag(db.Model):
    __tablename__ = "card_tags"
    card_id = db.Column(db.Integer, db.ForeignKey("cards.id", ondelete="CASCADE"), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
