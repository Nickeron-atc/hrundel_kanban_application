import { DragEvent } from "react";
import { Card } from "../../../services/api";
import styles from "./KanbanCard.module.css";

interface KanbanCardProps {
  card: Card;
  onDragStart: (e: DragEvent<HTMLDivElement>, cardId: string) => void;
  draggingId: string | null;
  onDelete?: (cardId: string) => void;
}

export default function KanbanCard({ card, onDragStart, draggingId, onDelete }: KanbanCardProps) {
  const isDragging = draggingId === card.id;

  return (
    <div
      className={[styles.card, isDragging ? styles.dragging : ""].filter(Boolean).join(" ")}
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      role="listitem"
    >
      <div className={styles.cardContent}>
        <p className={styles.title}>{card.title}</p>
        {card.description && (
          <p className={styles.description}>{card.description}</p>
        )}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(card.id)}
          className={styles.deleteBtn}
          title="Удалить задачу"
        >
          🗑️
        </button>
      )}
    </div>
  );
}