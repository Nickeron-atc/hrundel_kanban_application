// src/components/Features/BoardsListModal/BoardsListModal.tsx
// Модалка со списком досок. Открывается по клику на "Доски" в шапке.
import { useState, useEffect } from "react";
import { api, Board } from "../../../services/api";
import { AppModal } from "../../UI/AppModal/AppModal";
import { ConfirmDialog } from "../../UI/ConfirmDialog/ConfirmDialog";
import CreateBoardModal from "../CreateBoardModal/CreateBoardModal";
import Button from "../../UI/Button/Button";
import { useBoards } from "../../../contexts/BoardContext";

interface BoardsListModalProps {
    open: boolean;
    onClose: () => void;
    onSelectBoard: (boardId: string) => void;
    currentBoardId: string | null;
}

export default function BoardsListModal({
                                            open,
                                            onClose,
                                            onSelectBoard,
                                            currentBoardId,
                                        }: BoardsListModalProps) {
    // const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [boardIdToDelete, setBoardIdToDelete] = useState<string | null>(null);

    // const loadBoards = async () => {
    //     setLoading(true);
    //     const res = await api.getBoards();
    //     if (res.status === "ok") {
    //         setBoards(res.data.boards);
    //     }
    //     setLoading(false);
    // };

    const { boards, reloadBoards, setCurrentBoardId } = useBoards();

    // useEffect(() => {
    //     if (open) {
    //         loadBoards();
    //     }
    // }, [open]);

    // Было: loadBoards();
// Стало:
    useEffect(() => {
        if (open) {
            reloadBoards();
        }
    }, [open, reloadBoards]);

    // const handleCreateBoard = async (title: string) => {
    //     const res = await api.createBoard(title);
    //     if (res.status === "ok") {
    //         await loadBoards();
    //         setCreateModalOpen(false);
    //         return { ok: true };
    //     }
    //     return { ok: false, message: res.message };
    // };

    const handleCreateBoard = async (title: string) => {
        const res = await api.createBoard(title);
        if (res.status === "ok") {
            await reloadBoards(); // Обновляем глобальный список досок

            // Автоматически выбираем только что созданную доску
            if (res.data?.board?.id) {
                setCurrentBoardId(res.data.board.id);
            }

            setCreateModalOpen(false);
            return { ok: true };
        }
        return { ok: false, message: res.message };
    };

    const handleDeleteClick = (boardId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setBoardIdToDelete(boardId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!boardIdToDelete) return;
        const res = await api.deleteBoard(boardIdToDelete);
        if (res.status === "ok") {
            await loadBoards();
            setBoardIdToDelete(null);
        }
    };

    const handleSelectBoard = (boardId: string) => {
        onSelectBoard(boardId);
        onClose();
    };

    return (
        <>
            <AppModal
                open={open}
                onOpenChange={(isOpen) => !isOpen && onClose()}
                title="Мои доски"
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                            + Добавить доску
                        </Button>
                    </>
                }
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                        Загрузка...
                    </div>
                ) : boards.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                        У вас пока нет досок
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {boards.map((board) => (
                            <div
                                key={board.id}
                                onClick={() => handleSelectBoard(board.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 16px",
                                    borderRadius: "var(--radius)",
                                    border: board.id === currentBoardId ? "2px solid var(--color-primary)" : "1.5px solid var(--color-border)",
                                    background: board.id === currentBoardId ? "var(--color-primary-light)" : "var(--color-surface)",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    if (board.id !== currentBoardId) {
                                        e.currentTarget.style.borderColor = "var(--color-primary)";
                                        e.currentTarget.style.background = "var(--color-bg)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (board.id !== currentBoardId) {
                                        e.currentTarget.style.borderColor = "var(--color-border)";
                                        e.currentTarget.style.background = "var(--color-surface)";
                                    }
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text)" }}>
                                        {board.title}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                                        Владелец: Вы
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteClick(board.id, e)}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: "var(--radius-sm)",
                                        border: "none",
                                        background: "transparent",
                                        color: "var(--color-text-muted)",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(231, 76, 60, 0.1)";
                                        e.currentTarget.style.color = "var(--color-danger)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = "var(--color-text-muted)";
                                    }}
                                    title="Удалить доску"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </AppModal>

            <CreateBoardModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreateBoard={handleCreateBoard}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Удалить доску?"
                description="Все колонки и карточки будут удалены безвозвратно."
                confirmLabel="Удалить"
                variant="danger"
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
}