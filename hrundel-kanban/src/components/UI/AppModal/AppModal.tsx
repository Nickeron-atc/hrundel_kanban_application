// src/components/UI/AppModal/AppModal.tsx
import type { ReactNode } from "react";
import { useEffect } from "react";
import styles from "./AppModal.module.css";

interface AppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    closeOnOverlayClick?: boolean;
}

export function AppModal({
                             open,
                             onOpenChange,
                             title,
                             description,
                             children,
                             footer,
                             size = "md",
                             closeOnOverlayClick = true,
                         }: AppModalProps) {
    // Закрытие по Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && closeOnOverlayClick) {
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onOpenChange, closeOnOverlayClick]);

    // Блокировка скролла body
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const sizeClass = styles[size] || styles.md;

    return (
        <div
            className={styles.overlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && closeOnOverlayClick) {
                    onOpenChange(false);
                }
            }}
        >
            <div className={`${styles.modal} ${sizeClass}`} role="dialog" aria-modal="true">
                {title && (
                    <div className={styles.header}>
                        <h2 className={styles.title}>{title}</h2>
                        {closeOnOverlayClick && (
                            <button className={styles.close} onClick={() => onOpenChange(false)} aria-label="Закрыть">
                                ×
                            </button>
                        )}
                    </div>
                )}
                <div className={styles.body}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );
}