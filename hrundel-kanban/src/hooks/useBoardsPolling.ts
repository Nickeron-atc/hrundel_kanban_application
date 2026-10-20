import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useBoardsPolling(enabled: boolean = true, interval: number = 2000) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!enabled) return;

        const poll = async () => {
            const res = await api.getBoards();
            if (res.status === "ok") {
                queryClient.setQueryData(["boards"], res.data.boards);
            }
        };

        const intervalId = setInterval(poll, interval);

        return () => clearInterval(intervalId);
    }, [enabled, interval, queryClient]);
}
