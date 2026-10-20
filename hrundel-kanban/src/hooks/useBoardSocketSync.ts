import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function useBoardSocketSync(boardId: string | null) {
  const queryClient = useQueryClient();
  const prevBoardId = useRef<string | null>(null);

  useEffect(() => {
    const s = getSocket();

    if (prevBoardId.current && prevBoardId.current !== boardId) {
      s.emit('leave_board', { board_id: prevBoardId.current });
    }

    if (boardId) {
      s.emit('join_board', { board_id: boardId });
    }

    prevBoardId.current = boardId;

    const handleRefresh = (data: { board_id: string | number }) => {
      if (String(data.board_id) === String(boardId)) {
        queryClient.invalidateQueries({ queryKey: ['boards'] });
      }
    };

    s.on('board_refresh_needed', handleRefresh);

    return () => {
      s.off('board_refresh_needed', handleRefresh);
      if (boardId) {
        s.emit('leave_board', { board_id: boardId });
      }
    };
  }, [boardId, queryClient]);
}
