// src/pages/WorkSession/WorkSession.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api, Board } from "../../services/api";
import KanbanBoard from "../../components/Features/KanbanBoard/KanbanBoard";
import AddBoardModal from "../../components/Features/AddBoardModal/AddBoardModal";
import { ConfirmDialog } from "../../components/UI/ConfirmDialog/ConfirmDialog";
import styles from "./WorkSession.module.css";

export default function WorkSession() {
  const navigate = useNavigate();
  const [addBoardModalOpen, setAddBoardModalOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // State для диалогов подтверждения
  const [deleteBoardDialogOpen, setDeleteBoardDialogOpen] = useState(false);
  const [boardIdToDelete, setBoardIdToDelete] = useState<string | null>(null);

  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [columnIdToDelete, setColumnIdToDelete] = useState<string | null>(null);

  const [deleteCardDialogOpen, setDeleteCardDialogOpen] = useState(false);
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loadBoards = async () => {
      const res = await api.getBoards();
      if (res.status === "ok" && res.data.boards.length > 0) {
        setBoards(res.data.boards);
        setSelectedBoardId(res.data.boards[0].id);
      }
    };
    loadBoards();
  }, []);

  const handleAddBoard = async (title: string): Promise<{ ok: boolean; message?: string }> => {
    const res = await api.createBoard(title);
    if (res.status !== "ok") {
      return { ok: false, message: res.message };
    }
    setBoards(prev => [...prev, res.data.board]);
    setSelectedBoardId(res.data.board.id);
    return { ok: true };
  };

  // Клик по кнопке удаления доски → открывает диалог
  const handleDeleteBoardClick = (boardId: string) => {
    setBoardIdToDelete(boardId);
    setDeleteBoardDialogOpen(true);
  };

  // Подтверждение удаления → выполняет удаление
  const handleDeleteBoardConfirm = async () => {
    if (!boardIdToDelete) return;
    const res = await api.deleteBoard(boardIdToDelete);
    if (res.status !== "ok") return;
    const remaining = boards.filter(b => b.id !== boardIdToDelete);
    setBoards(remaining);
    if (selectedBoardId === boardIdToDelete) {
      setSelectedBoardId(remaining[0]?.id ?? null);
    }
    setBoardIdToDelete(null);
  };

  const handleAddColumn = async (boardId: string, title: string) => {
    const res = await api.createColumn(boardId, title);
    if (res.status === "ok") {
      setBoards(prev => prev.map(b =>
          b.id === boardId
              ? { ...b, columns: [...b.columns, res.data.column] }
              : b,
      ));
    }
  };

  // Клик по кнопке удаления колонки → открывает диалог
  const handleDeleteColumnClick = (columnId: string) => {
    setColumnIdToDelete(columnId);
    setDeleteColumnDialogOpen(true);
  };

  // Подтверждение удаления колонки
  const handleDeleteColumnConfirm = async () => {
    if (!columnIdToDelete || !selectedBoardId) return;
    const res = await api.deleteColumn(selectedBoardId, columnIdToDelete);
    if (res.status === "ok") {
      setBoards(prev => prev.map(b =>
          b.id === selectedBoardId
              ? { ...b, columns: b.columns.filter(c => c.id !== columnIdToDelete) }
              : b,
      ));
    }
    setColumnIdToDelete(null);
  };

  const handleAddCard = async (
      boardId: string,
      columnId: string,
      title: string,
      description: string,
  ) => {
    const res = await api.createCard(boardId, columnId, title, description);
    if (res.status !== "ok") return;
    setBoards(prev => prev.map(b =>
        b.id === boardId
            ? {
              ...b,
              columns: b.columns.map(c =>
                  c.id === columnId
                      ? { ...c, cards: [...c.cards, res.data.card] }
                      : c,
              ),
            }
            : b,
    ));
  };

  const handleMoveCard = async (
      boardId: string,
      cardId: string,
      targetColumnId: string,
  ) => {
    const res = await api.moveCard(boardId, cardId, targetColumnId);
    if (res.status !== "ok") return;
    setBoards(prev => prev.map(b => {
      if (b.id !== boardId) return b;
      const card = b.columns
          .flatMap(c => c.cards)
          .find(x => x.id === cardId);
      if (!card) return b;
      return {
        ...b,
        columns: b.columns.map(c => {
          if (c.cards.some(x => x.id === cardId)) {
            return { ...c, cards: c.cards.filter(x => x.id !== cardId) };
          }
          if (c.id === targetColumnId) {
            return { ...c, cards: [...c.cards, card] };
          }
          return c;
        }),
      };
    }));
  };

  // Клик по кнопке удаления карточки → открывает диалог
  const handleDeleteCardClick = (cardId: string) => {
    setCardIdToDelete(cardId);
    setDeleteCardDialogOpen(true);
  };

  // Подтверждение удаления карточки
  const handleDeleteCardConfirm = async () => {
    if (!cardIdToDelete || !selectedBoardId) return;
    const res = await api.deleteCard(selectedBoardId, cardIdToDelete);
    if (res.status !== "ok") return;
    setBoards(prev => prev.map(b =>
        b.id === selectedBoardId
            ? {
              ...b,
              columns: b.columns.map(c => ({
                ...c,
                cards: c.cards.filter(card => card.id !== cardIdToDelete),
              })),
            }
            : b,
    ));
    setCardIdToDelete(null);
  };

  const currentBoard = boards.find(board => board.id === selectedBoardId) || null;

  return (
      <main className={styles.workSessionPage}>
        <div className={styles.boardHeader}>
          <h1>Мои доски</h1>
          <button
              onClick={() => setAddBoardModalOpen(true)}
              className={styles.addBoardButton}
          >
            + Новая доска
          </button>
        </div>
        {boards.length > 1 && (
            <div className={styles.boardSelector}>
              <label className={styles.boardSelectorLabel} htmlFor="board-select">
                Выберите доску:
              </label>
              <select
                  id="board-select"
                  value={selectedBoardId || ""}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className={styles.boardSelect}
              >
                {boards.map(board => (
                    <option key={board.id} value={board.id}>
                      {board.title}
                    </option>
                ))}
              </select>
              <button
                  onClick={() => selectedBoardId && handleDeleteBoardClick(selectedBoardId)}
                  className={styles.deleteBoardButton}
                  disabled={!selectedBoardId}
                  title="Удалить текущую доску"
              >
                <h3>Удалить доску</h3>
              </button>
            </div>
        )}
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
        <AddBoardModal
            visible={addBoardModalOpen}
            onClose={() => setAddBoardModalOpen(false)}
            onAdd={handleAddBoard}
        />

        {/* Диалоги подтверждения */}
        <ConfirmDialog
            open={deleteBoardDialogOpen}
            onOpenChange={setDeleteBoardDialogOpen}
            title="Удалить доску?"
            description="Все колонки и карточки будут удалены безвозвратно."
            confirmLabel="Удалить"
            variant="danger"
            onConfirm={handleDeleteBoardConfirm}
        />

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