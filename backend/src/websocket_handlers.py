from flask_socketio import emit, join_room, leave_room
from flask import request
from models import Board, Card, Column
from extensions import db

def register_socket_handlers(socketio):
    @socketio.on('connect')
    def handle_connect():
        print(f"Client connected: {request.sid}")

    @socketio.on('disconnect')
    def handle_disconnect():
        print(f"Client disconnected: {request.sid}")

    @socketio.on('join_board')
    def handle_join_board(data):
        board_id = data.get('board_id')
        if board_id:
            join_room(f"board_{board_id}")
            print(f"User joined board room: board_{board_id}")

    @socketio.on('leave_board')
    def handle_leave_board(data):
        board_id = data.get('board_id')
        if board_id:
            leave_room(f"board_{board_id}")
            print(f"User left board room: board_{board_id}")

    @socketio.on('card_moved')
    def handle_card_moved(data):
        board_id = data.get('board_id')
        card_id = data.get('card_id')
        target_column_id = data.get('target_column_id')
        
        if board_id and card_id and target_column_id:
            card = Card.query.get(card_id)
            if card:
                card.column_id = target_column_id
                db.session.commit()
                
                emit('card_updated', {
                    'card_id': card_id,
                    'target_column_id': target_column_id
                }, room=f"board_{board_id}", include_self=False)

    @socketio.on('card_created')
    def handle_card_created(data):
        board_id = data.get('board_id')
        if board_id:
            emit('board_refresh_needed', {
                'board_id': board_id
            }, room=f"board_{board_id}", include_self=False)

    @socketio.on('card_deleted')
    def handle_card_deleted(data):
        board_id = data.get('board_id')
        if board_id:
            emit('board_refresh_needed', {
                'board_id': board_id
            }, room=f"board_{board_id}", include_self=False)

    @socketio.on('column_created')
    def handle_column_created(data):
        board_id = data.get('board_id')
        if board_id:
            emit('board_refresh_needed', {
                'board_id': board_id
            }, room=f"board_{board_id}", include_self=False)

    @socketio.on('column_deleted')
    def handle_column_deleted(data):
        board_id = data.get('board_id')
        if board_id:
            emit('board_refresh_needed', {
                'board_id': board_id
            }, room=f"board_{board_id}", include_self=False)
            