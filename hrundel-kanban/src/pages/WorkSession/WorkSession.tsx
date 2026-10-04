// src/pages/WorkSession/WorkSession.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api } from "../../services/api";
import KanbanBoard from "../../components/Features/KanbanBoard/KanbanBoard";
import { ConfirmDialog } from "../../components/UI/ConfirmDialog/ConfirmDialog";
import { useBoards } from "../../contexts/BoardContext";
import { useState } from "react";
import styles from "./WorkSession.module.css";

export default function WorkSession() {
  const navigate = useNavigate();
  const { boards, currentBoardId, setCurrentBoardId, reloadBoards } = useBoards();

  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [columnIdToDelete, setColumnIdToDelete] = useState<string | null>(null);

  const [deleteCardDialogOpen, setDeleteCardDialogOpen] = useState(false);
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!auth.isLoggedIn()) {
  //     navigate("/login", { replace: true });
  //   }
  // }, [navigate]);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate("/login", { replace: true });
    } else {
      // Гарантируем, что у нас свежие доски именно для текущего пользователя
      reloadBoards();
    }
  }, [navigate, reloadBoards]);

  const currentBoard = boards.find((b) => b.id === currentBoardId) || null;

  const handleAddColumn = async (boardId: string, title: string) => {
    const res = await api.createColumn(boardId, title);
    if (res.status === "ok") {
      await reloadBoards();
    }
  };

  const handleDeleteColumnClick = (columnId: string) => {
    setColumnIdToDelete(columnId);
    setDeleteColumnDialogOpen(true);
  };

  const handleDeleteColumnConfirm = async () => {
    if (!columnIdToDelete || !currentBoardId) return;
    const res = await api.deleteColumn(currentBoardId, columnIdToDelete);
    if (res.status === "ok") {
      await reloadBoards();
    }
    setColumnIdToDelete(null);
  };

  const handleAddCard = async (boardId: string, columnId: string, title: string, description: string) => {
    const res = await api.createCard(boardId, columnId, title, description);
    if (res.status === "ok") {
      await reloadBoards();
    }
  };

  const handleMoveCard = async (boardId: string, cardId: string, targetColumnId: string) => {
    const res = await api.moveCard(boardId, cardId, targetColumnId);
    if (res.status === "ok") {
      await reloadBoards();
    }
  };

  const handleDeleteCardClick = (cardId: string) => {
    setCardIdToDelete(cardId);
    setDeleteCardDialogOpen(true);
  };

  const handleDeleteCardConfirm = async () => {
    if (!cardIdToDelete || !currentBoardId) return;
    const res = await api.deleteCard(currentBoardId, cardIdToDelete);
    if (res.status === "ok") {
      await reloadBoards();
    }
    setCardIdToDelete(null);
  };

  return (
      <main className={styles.workSessionPage}>
        {currentBoard ? (
            <KanbanBoard
                board={currentBoard}
                onAddColumn={(title) => handleAddColumn(currentBoard.id, title)}
                onDeleteColumn={handleDeleteColumnClick}
                onAddCard={(columnId, title, description) =>
                    handleAddCard(currentBoard.id, columnId, title, description)
                }
                onMoveCard={(cardId, targetColumnId) =>
                    handleMoveCard(currentBoard.id, cardId, targetColumnId)
                }
                onDeleteCard={handleDeleteCardClick}
            />
        ) : (
            <div className={styles.noBoard}>Нет доступных досок</div>
        )}

        <ConfirmDialog
            open={deleteColumnDialogOpen}
            onOpenChange={setDeleteColumnDialogOpen}
            title="Удалить колонку?"
            description="Все карточки в этой колонке будут удалены."
            confirmLabel="Удалить"
            variant="danger"
            onConfirm={handleDeleteColumnConfirm}
        />

        <ConfirmDialog
            open={deleteCardDialogOpen}
            onOpenChange={setDeleteCardDialogOpen}
            title="Удалить карточку?"
            description="Это действие нельзя отменить."
            confirmLabel="Удалить"
            variant="danger"
            onConfirm={handleDeleteCardConfirm}
        />
      </main>
  );
}