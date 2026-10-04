// src/contexts/BoardContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, Board } from "../services/api";

interface BoardContextType {
    boards: Board[];
    currentBoardId: string | null;
    setCurrentBoardId: (id: string) => void;
    isBoardsModalOpen: boolean;
    openBoardsModal: () => void;
    closeBoardsModal: () => void;
    reloadBoards: () => Promise<void>;
}

const BoardContext = createContext<BoardContextType | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
    const [boards, setBoards] = useState<Board[]>([]);
    const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
    const [isBoardsModalOpen, setIsBoardsModalOpen] = useState(false);

    const reloadBoards = async () => {
        const res = await api.getBoards();
        if (res.status === "ok") {
            setBoards(res.data.boards);
            if (res.data.boards.length > 0 && !currentBoardId) {
                setCurrentBoardId(res.data.boards[0].id);
            }
        }
    };

    useEffect(() => {
        if (localStorage.getItem("auth_token")) {
            reloadBoards();
        }
    }, []);

    return (
        <BoardContext.Provider
            value={{
                boards,
                currentBoardId,
                setCurrentBoardId,
                isBoardsModalOpen,
                openBoardsModal: () => setIsBoardsModalOpen(true),
                closeBoardsModal: () => setIsBoardsModalOpen(false),
                reloadBoards,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
}

export function useBoards() {
    const ctx = useContext(BoardContext);
    if (!ctx) throw new Error("useBoards must be used within BoardProvider");
    return ctx;
}