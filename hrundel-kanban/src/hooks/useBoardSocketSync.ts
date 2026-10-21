import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      // polling первым - это самый надежный способ пройти через прокси, 
      // затем socket.io сам сделает апгрейд до websocket
      transports: ['polling', 'websocket'],
      path: '/socket.io',
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function useBoardSocketSync(boardId: string | null, onRefresh?: () => void) {
  const queryClient = useQueryClient();
  const prevBoardId = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const s = getSocket();

    if (prevBoardId.current && prevBoardId.current !== boardId) {
      s.emit('leave_board', { board_id: prevBoardId.current });
    }

    if (boardId) {
      s.emit('join_board', { board_id: boardId });
    }

    prevBoardId.current = boardId;

    const handleRefresh = (data: { board_id: string | number }) => {
      if (!isMounted.current) return; // Защита от обновления состояния размонтированного компонента
      
      if (String(data.board_id) === String(boardId)) {
        if (onRefresh) {
          onRefresh();
        } else {
          queryClient.invalidateQueries({ queryKey: ['boards'] });
        }
      }
    };

    // Явно удаляем старый слушатель перед добавлением нового, 
    // чтобы избежать дублирования из-за Strict Mode
    s.off('board_refresh_needed', handleRefresh);
    s.on('board_refresh_needed', handleRefresh);

    return () => {
      isMounted.current = false;
      s.off('board_refresh_needed', handleRefresh);
      if (boardId) {
        s.emit('leave_board', { board_id: boardId });
      }
    };
  }, [boardId, queryClient, onRefresh]);
}
