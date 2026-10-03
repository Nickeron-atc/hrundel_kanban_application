import { DragEvent } from "react";
import { Card } from "../../../services/api";
import styles from "./KanbanCard.module.css";

interface KanbanCardProps {
  card: Card;
  onDragStart: (e: DragEvent<HTMLDivElement>, cardId: string) => void;
  draggingId: string | null;
  onDeleteCard?: (cardId: string) => void;
}

export default function KanbanCard({ card, onDragStart, draggingId, onDeleteCard }: KanbanCardProps) {
  const isDragging = draggingId === card.id;

  return (
    <div
      className={[styles.card, isDragging ? styles.dragging : ""].filter(Boolean).join(" ")}
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      role="listitem"
    >
      {onDeleteCard && (
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCard(card.id);
          }}
          title="Удалить карточку"
          aria-label={`Удалить карточку ${card.title}`}
        >
          ✕
        </button>
      )}

      <div className={styles.content}>
        <p className={styles.title}>{card.title}</p>
        {card.description && (
          <p className={styles.description}>{card.description}</p>
        )}
      </div>

      <button
        className={styles.moreButton}
        onClick={(e) => {
          e.stopPropagation();
        }}
        title="Действия"
        aria-label="Действия с карточкой"
      >
        ⋯
      </button>
    </div>
  );
}