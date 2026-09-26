import { DragEvent } from "react";
import { Card } from "../../../services/api";
import styles from "./KanbanCard.module.css";

interface KanbanCardProps {
  card: Card;
  onDragStart: (e: DragEvent<HTMLDivElement>, cardId: string) => void;
  draggingId: string | null;
  onDeleteCard?: (cardId: string) => void;
}

/**
 * @param card         - данные карточки
 * @param onDragStart  - callback начала перетаскивания
 * @param draggingId   - id карточки, которая сейчас перетаскивается
 */
export default function KanbanCard({ card, onDragStart, draggingId, onDeleteCard }: KanbanCardProps) {
  const isDragging = draggingId === card.id;

  // return (
  //   <div
  //     className={[styles.card, isDragging ? styles.dragging : ""].filter(Boolean).join(" ")}
  //     draggable
  //     onDragStart={(e) => onDragStart(e, card.id)}
  //     role="listitem"
  //   >
  //     <p className={styles.title}>{card.title}</p>
  //     {card.description && (
  //       <p className={styles.description}>{card.description}</p>
  //     )}
  //   </div>
  // );

  return (
      <div
          className={[styles.card, isDragging ? styles.dragging : ""].filter(Boolean).join(" ")}
          draggable
          onDragStart={(e) => onDragStart(e, card.id)}
          role="listitem"
      >
        <div className={styles.titleRow}>
          <p className={styles.title}>{card.title}</p>
        </div>
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
        {card.description && (
            <p className={styles.description}>{card.description}</p>
        )}
      </div>
  );
}
