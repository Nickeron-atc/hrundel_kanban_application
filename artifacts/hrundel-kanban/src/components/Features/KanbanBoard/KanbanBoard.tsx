import { useState, useEffect, DragEvent, useCallback, useRef } from "react";
import { api, Board, Column } from "../../../services/api";
import KanbanColumn from "../KanbanColumn/KanbanColumn";
import Modal from "../../UI/Modal/Modal";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import styles from "./KanbanBoard.module.css";


import cardMoveSound from '../../../assets/sounds/card-move.mp3';
export default function KanbanBoard() {
  const cardMoveAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    cardMoveAudioRef.current = new Audio(cardMoveSound);
  }, []); 
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const [addModal, setAddModal] = useState(false);
  const [addColumnId, setAddColumnId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.getBoards();
      if (res.status === "ok" && res.data.boards.length > 0) {
        setBoard(res.data.boards[0]);
      } else {
        setError(res.message ?? "Не удалось загрузить доску");
      }
      setLoading(false);
    })();
  }, []);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, cardId: string) => {
      setDraggingCardId(cardId);
      const col = board?.columns.find((c) =>
        c.cards.some((card) => card.id === cardId)
      );
      setSourceColumnId(col?.id ?? null);
      e.dataTransfer.effectAllowed = "move";
    },
    [board]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, columnId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverColumnId(columnId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverColumnId(null);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>, targetColumnId: string) => {
      e.preventDefault();
      setDragOverColumnId(null);

      if (!draggingCardId || !sourceColumnId || !board) return;
      if (sourceColumnId === targetColumnId) {
        setDraggingCardId(null);
        setSourceColumnId(null);
        return;
      }

      // 🔊 ВОСПРОИЗВЕДЕНИЕ ЗВУКА (добавьте эту строку)
      if (cardMoveAudioRef.current) {
        cardMoveAudioRef.current.currentTime = 0;
        cardMoveAudioRef.current.play().catch(e => {
          console.debug('Звук не проигрался:', e);
        });
      }


      const srcCol = board.columns.find((c) => c.id === sourceColumnId)!;
      const card = srcCol.cards.find((c) => c.id === draggingCardId)!;

      const newColumns: Column[] = board.columns.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== draggingCardId) };
        }
        if (col.id === targetColumnId) {
          return { ...col, cards: [...col.cards, card] };
        }
        return col;
      });

      setBoard({ ...board, columns: newColumns });
      setDraggingCardId(null);
      setSourceColumnId(null);

      await api.moveCard(board.id, draggingCardId, targetColumnId);
    },
    [draggingCardId, sourceColumnId, board]
  );

  const openAddModal = useCallback((columnId: string) => {
    setAddColumnId(columnId);
    setNewTitle("");
    setNewDescription("");
    setAddError("");
    setAddModal(true);
  }, []);

  const handleAddCard = useCallback(() => {
    if (!newTitle.trim()) {
      setAddError("Введите название задачи");
      return;
    }
    if (!addColumnId || !board) return;

    const newCard = {
      id: `card-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
    };

    const newColumns = board.columns.map((col) =>
      col.id === addColumnId
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    );

    setBoard({ ...board, columns: newColumns });
    setAddModal(false);
  }, [newTitle, newDescription, addColumnId, board]);

  if (loading) {
    return (
      <div className={styles.board}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Загрузка доски...</span>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className={styles.board}>
        <div className={styles.loading}>
          <span style={{ color: "var(--color-danger)" }}>
            {error ?? "Доска не найдена"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h1 className={styles.title}>{board.title}</h1>
      </div>

      <div className={styles.columns}>
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            draggingId={draggingCardId}
            dragOverColumnId={dragOverColumnId}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onAddCard={openAddModal}
          />
        ))}
      </div>

      <Modal
        visible={addModal}
        onClose={() => setAddModal(false)}
        title="Новая задача"
      >
        <div className={styles.formGroup}>
          <Input
            label="Название *"
            placeholder="Введите название задачи"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setAddError("");
            }}
            error={addError}
            autoFocus
          />
          <Input
            label="Описание"
            placeholder="Краткое описание (опционально)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </div>
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={() => setAddModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleAddCard}>
            Добавить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
