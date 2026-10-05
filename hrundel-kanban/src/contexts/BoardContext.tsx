// src/contexts/BoardContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
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

    // Ref хранит актуальный currentBoardId, чтобы не добавлять его в зависимости useCallback
    const currentBoardIdRef = useRef(currentBoardId);
    currentBoardIdRef.current = currentBoardId;

    // Оборачиваем в useCallback с пустым массивом зависимостей.
    // Теперь ссылка на функцию стабильна и не меняется при перерендерах.
    const reloadBoards = useCallback(async () => {
        const res = await api.getBoards();
        if (res.status === "ok") {
            setBoards(res.data.boards);

            const cId = currentBoardIdRef.current;
            const hasCurrent = res.data.boards.some((b) => b.id === cId);

            if (!hasCurrent && res.data.boards.length > 0) {
                setCurrentBoardId(res.data.boards[0].id);
            } else if (res.data.boards.length === 0) {
                setCurrentBoardId(null);
            }
        }
    }, []);

    // Добавляем reloadBoards в зависимости, теперь ESLint не будет ругаться,
    // а цикл прервется, так как ссылка на функцию больше не меняется.
    useEffect(() => {
        if (localStorage.getItem("auth_token")) {
            reloadBoards();
        }
    }, [reloadBoards]);

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