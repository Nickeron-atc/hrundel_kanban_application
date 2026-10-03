import { DragEvent } from "react";
import { Column } from "../../../services/api";
import KanbanCard from "../KanbanCard/KanbanCard";
import styles from "./KanbanColumn.module.css";

// interface KanbanColumnProps {
//   column: Column;
//   boardId?: string;
//   draggingId: string | null;
//   dragOverColumnId: string | null;
//   onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
//   onDragOver: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
//   onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
//   onDragLeave: () => void;
//   onAddCard: (columnId: string) => void;
//   onDeleteColumn?: (boardId: string, columnId: string) => void;
// }


interface KanbanColumnProps {
  column: Column;
  draggingId: string | null;
  dragOverColumnId: string | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onDragLeave: () => void;
  onAddCard: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onDeleteCard?: (cardId: string) => void;
}
export default function KanbanColumn({
  column,
  // boardId,
  draggingId,
  dragOverColumnId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  onAddCard,
  onDeleteColumn,
 onDeleteCard
}: KanbanColumnProps) {
  const isDragOver = dragOverColumnId === column.id;

  return (
    <div
      className={[styles.column, isDragOver ? styles.dragOver : ""].filter(Boolean).join(" ")}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDrop={(e) => onDrop(e, column.id)}
      onDragLeave={onDragLeave}
      role="list"
      aria-label={column.title}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{column.title}</span>
          <span className={styles.count}>{column.cards.length}</span>
        </div>
        
        {onDeleteColumn && (
          <button
            onClick={() => onDeleteColumn(column.id)}
            className={styles.deleteButton}
            title="Удалить колонку"
            aria-label="Удалить колонку"
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.cards}>
        {column.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onDragStart={onDragStart}
            draggingId={draggingId}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>

      <button
        className={styles.addBtn}
        onClick={() => onAddCard(column.id)}
        aria-label={`Добавить задачу в ${column.title}`}
      >
        + Добавить задачу
      </button>
    </div>
  );
}
