// hrundel-kanban/src/hooks/useBoardSocketSync.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const socket = io(window.location.origin, {
  transports: ['polling', 'websocket'],
  path: '/socket.io',
});

export function useBoardSocketSync(boardId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    socket.emit('join_board', { board_id: boardId });

    const handleRefresh = (data: { board_id: string | number }) => {
      if (String(data.board_id) === boardId) {
        queryClient.invalidateQueries({ queryKey: ['boards'] });
      }
    };

    socket.on('board_refresh_needed', handleRefresh);

    return () => {
      socket.emit('leave_board', { board_id: boardId });
      socket.off('board_refresh_needed', handleRefresh);
    };
  }, [boardId, queryClient]);
}
