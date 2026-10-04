// src/components/Features/KanbanCard/KanbanCard.tsx
import { DragEvent, useState } from "react";
import { Card } from "../../../services/api";
import styles from "../KanbanCard/KanbanCard.module.css";
import { CardDetailsModal } from "../CardDetailsModal/CardDetailsModal";

interface KanbanCardProps {
  card: Card;
  onDragStart: (e: DragEvent<HTMLDivElement>, cardId: string) => void;
  draggingId: string | null;
  onDeleteCard?: (cardId: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => Promise<void>;
}

export default function KanbanCard({ card, onDragStart, draggingId, onDeleteCard, onUpdateCard }: KanbanCardProps) {
  const isDragging = draggingId === card.id;
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleSaveDetails = async (updates: Partial<Card>) => {
    if (onUpdateCard) {
      await onUpdateCard(card.id, updates);
    }
  };

  return (
      <>
        <div
            className={[styles.card, isDragging ? styles.dragging : ""].filter(Boolean).join(" ")}
            draggable
            onDragStart={(e) => onDragStart(e, card.id)}
            role="listitem"
            style={{
              borderLeft: card.color ? `4px solid ${card.color}` : undefined,
            }}
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
            {card.tags && card.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                  {card.tags.slice(0, 3).map((tag) => (
                      <span
                          key={tag.id}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--color-primary-light)",
                            color: "var(--color-primary)",
                          }}
                      >
                  {tag.name}
                </span>
                  ))}
                  {card.tags.length > 3 && (
                      <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                  +{card.tags.length - 3}
                </span>
                  )}
                </div>
            )}
          </div>
          <button
              className={styles.moreButton}
              onClick={(e) => {
                e.stopPropagation();
                setDetailsModalOpen(true);
              }}
              title="Детали карточки"
              aria-label="Детали карточки"
          >
            ⋯
          </button>
        </div>

        <CardDetailsModal
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            card={{
              id: card.id,
              title: card.title,
              description: card.description || "",
              color: card.color || "",
              tags: card.tags || [],
              creator: card.creator || { name: "Неизвестно", avatarUrl: "" },
            }}
            onSave={handleSaveDetails}
            availableTags={[]} // TODO: загрузить из API
            onCreateTag={async (name, color) => {
              // TODO: реализовать создание тега через API
              return { id: Date.now().toString(), name, color };
            }}
        />
      </>
  );
}