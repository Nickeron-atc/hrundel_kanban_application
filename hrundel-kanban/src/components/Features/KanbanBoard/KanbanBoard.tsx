// src/components/Features/KanbanBoard/KanbanBoard.tsx
import { useState, DragEvent, useCallback, useRef, useEffect } from "react";
import { api, Column, Board } from "../../../services/api";
import KanbanColumn from "../KanbanColumn/KanbanColumn";
// Заменяем импорт старого Modal на новый AppModal
import { AppModal } from "../../UI/AppModal/AppModal";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import styles from "./KanbanBoard.module.css";
import cardMoveSound from '../../../assets/sounds/card-move.mp3';

interface KanbanBoardProps {
    board: Board;
    onAddColumn?: (title: string) => void | Promise<void>;
    onDeleteColumn?: (columnId: string) => void | Promise<void>;
    onAddCard?: (columnId: string, title: string, description: string) => void | Promise<void>;
    onDeleteCard?: (cardId: string) => void | Promise<void>;
    onMoveCard?: (cardId: string, targetColumnId: string) => void | Promise<void>;
}

export default function KanbanBoard({
                                        board,
                                        onAddColumn,
                                        onDeleteColumn,
                                        onAddCard,
                                        onDeleteCard,
                                        onMoveCard,
                                    }: KanbanBoardProps) {
    const cardMoveAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        cardMoveAudioRef.current = new Audio(cardMoveSound);
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
    const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
    const [addModal, setAddModal] = useState(false);
    const [addColumnId, setAddColumnId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [addError, setAddError] = useState("");
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState("");

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

            if (!draggingCardId || !sourceColumnId) return;
            if (sourceColumnId === targetColumnId) {
                setDraggingCardId(null);
                setSourceColumnId(null);
                return;
            }

            if (cardMoveAudioRef.current) {
                cardMoveAudioRef.current.currentTime = 0;
                cardMoveAudioRef.current.play().catch(() => {});
            }

            await onMoveCard?.(draggingCardId, targetColumnId);
            setDraggingCardId(null);
            setSourceColumnId(null);
        },
        [draggingCardId, sourceColumnId, onMoveCard],
    );

    const openAddModal = useCallback((columnId: string) => {
        setAddColumnId(columnId);
        setNewTitle("");
        setNewDescription("");
        setAddError("");
        setAddModal(true);
    }, []);

    const handleAddCard = useCallback(async () => {
        if (!newTitle.trim()) {
            setAddError("Введите название задачи");
            return;
        }
        if (!addColumnId || !onAddCard) return;
        await onAddCard(addColumnId, newTitle.trim(), newDescription.trim());
        setAddModal(false);
    }, [newTitle, newDescription, addColumnId, onAddCard]);

    const handleAddColumnClick = async () => {
        if (!newColumnTitle.trim() || !onAddColumn) return;
        await onAddColumn(newColumnTitle.trim());
        setNewColumnTitle("");
        setIsAddingColumn(false);
    };

    return (
        <div className={styles.board}>

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
                        onDeleteColumn={onDeleteColumn}
                        onDeleteCard={onDeleteCard}
                    />
                ))}
                <div className={styles.addColumnWrapper}>
                    {isAddingColumn ? (
                        <div className={styles.addColumnForm}>
                            <input
                                type="text"
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                placeholder="Название колонки"
                                className={styles.columnInput}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddColumnClick()}
                            />
                            <div className={styles.columnActions}>
                                <button onClick={handleAddColumnClick} className={styles.addBtn}>
                                    Добавить
                                </button>
                                <button
                                    onClick={() => { setIsAddingColumn(false); setNewColumnTitle(""); }}
                                    className={styles.cancelBtn}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingColumn(true)} className={styles.addColumnBtn}>
                            + Добавить колонку
                        </button>
                    )}
                </div>
            </div>

            {/* Мигрируем модалку на AppModal */}
            <AppModal
                open={addModal}
                onOpenChange={setAddModal}
                title="Новая задача"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setAddModal(false)}>
                            Отмена
                        </Button>
                        <Button variant="primary" onClick={handleAddCard}>
                            Добавить
                        </Button>
                    </>
                }
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
            </AppModal>
        </div>
    );
}