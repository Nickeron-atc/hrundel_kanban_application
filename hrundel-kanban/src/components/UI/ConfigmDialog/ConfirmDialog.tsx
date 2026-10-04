// src/components/UI/ConfirmDialog/ConfirmDialog.tsx
// Диалог подтверждения на базе Radix AlertDialog.
// В отличие от AppModal, не закрывается по Escape / клику по оверлею —
// пользователь обязан явно выбрать действие.
import type { ReactNode } from "react";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    /** Открыт ли диалог */
    open: boolean;
    /** Коллбэк при изменении состояния (закрытие после подтверждения/отмены) */
    onOpenChange: (open: boolean) => void;
    /** Заголовок-вопрос (например, "Удалить доску?") */
    title: string;
    /** Пояснение последствий (например, "Все колонки и карточки будут удалены.") */
    description: string;
    /** Коллбэк подтверждения. Поддерживает async — кнопки будут заблокированы до завершения */
    onConfirm: () => void | Promise<void>;
    /** Текст кнопки подтверждения */
    confirmLabel?: string;
    /** Текст кнопки отмены */
    cancelLabel?: string;
    /** Стиль кнопки подтверждения: "danger" — красная (для удаления), "default" — обычная */
    variant?: "default" | "danger";
    /** Опциональная иконка слева от заголовка */
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
    // Локальное состояние загрузки — чтобы не требовать его от родителя.
    // Если onConfirm — async, мы сами отслеживаем промис и блокируем кнопки.
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            // Закрываем только после успешного выполнения.
            // Если onConfirm выбросит ошибку — диалог останется открытым,
            // пользователь сможет попробовать снова или отменить.
            onOpenChange(false);
        } catch (err) {
            // Здесь можно добавить toast с ошибкой в будущем.
            console.error("ConfirmDialog: onConfirm failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
        <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-3">
        {icon && (
            <span
            className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                variant === "danger"
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}
            >
            {icon}
            </span>
        )}
        {title}
        </AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
        <AlertDialogAction
        onClick={(e) => {
            // Предотвращаем стандартное закрытие AlertDialogAction —
            // мы сами закроем диалог после выполнения onConfirm.
            e.preventDefault();
            handleConfirm();
        }}
        disabled={loading}
        className={cn(
            variant === "danger" &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive-border"
        )}
        >
        {loading ? "Выполняется..." : confirmLabel}
        </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}
