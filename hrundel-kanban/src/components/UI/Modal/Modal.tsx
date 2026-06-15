import { ReactNode, useEffect } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * @param visible  - показывать/скрывать модалку
 * @param onClose  - callback при закрытии
 * @param title    - заголовок
 */
export default function Modal({ visible, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {(title != null) && (
          <div className={styles.header}>
            <span className={styles.title}>{title}</span>
            <button className={styles.close} onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
