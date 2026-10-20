import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useCurrentBoardPolling(boardId: string | null, enabled: boolean = true, interval: number = 2000) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled || !boardId) return;

        const poll = async () => {
            const res = await api.getBoards();
            if (res.status === "ok") {
                const boards = res.data.boards;
                const currentBoard = boards.find(b => b.id === boardId);
                
                if (currentBoard) {
                    queryClient.setQueryData(["boards"], boards);
                }
            }
        };

        const intervalId = setInterval(poll, interval);

        return () => clearInterval(intervalId);
    }, [enabled, interval, boardId, queryClient]);
}
