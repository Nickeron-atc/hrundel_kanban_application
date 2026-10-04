// src/components/UI/ConfirmDialog/ConfirmDialog.tsx
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "danger";
    icon?: ReactNode;
}

export function ConfirmDialog({
                                  open,
                                  onOpenChange,
                                  title,
                                  description,
                                  onConfirm,
                                  confirmLabel = "Подтвердить",
                                  cancelLabel = "Отмена",
                                  variant = "default",
                                  icon,
                              }: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

    // Блокируем закрытие по Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault(); // Блокируем закрытие
            }
        };
        document.addEventListener("keydown", handler, true); // true — перехватываем на фазе capture
        return () => document.removeEventListener("keydown", handler, true);
    }, [open]);

    // Блокируем скролл body
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            onOpenChange(false);
        } catch (err) {
            console.error("ConfirmDialog: onConfirm failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} role="alertdialog" aria-modal="true">
                <div className={styles.header}>
                    {icon && (
                        <span
                            className={`${styles.icon} ${
                                variant === "danger" ? styles.iconDanger : styles.iconDefault
                            }`}
                        >
              {icon}
            </span>
                    )}
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <p className={styles.description}>{description}</p>
                <div className={styles.footer}>
                    <button
                        className={styles.cancelBtn}
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${
                            variant === "danger" ? styles.confirmDanger : styles.confirmDefault
                        }`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Выполняется..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}