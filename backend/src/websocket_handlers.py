from flask_socketio import emit, join_room, leave_room
from flask import request

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
            