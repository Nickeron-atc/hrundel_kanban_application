// src/components/UI/AppModal/AppModal.tsx
// Базовое переиспользуемое модальное окно на базе Radix Dialog.
// Решает проблемы кастомного Modal: фокус-трап, блокировка скролла, портал, Escape из коробки.
import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AppModalProps {
    /** Открыто ли окно */
    open: boolean;
    /** Коллбэк при изменении состояния (закрытие по Escape / клику по оверлею) */
    onOpenChange: (open: boolean) => void;
    /** Заголовок. Если не передан — шапка не рендерится. */
    title?: string;
    /** Опциональное описание для screen readers (и визуально мелким шрифтом) */
    description?: string;
    /** Контент модалки */
    children: ReactNode;
    /** Опциональный футер — обычно сюда кладут кнопки "Отмена" / "Сохранить" */
    footer?: ReactNode;
    /** Максимальная ширина (по умолчанию "md" = max-w-lg) */
    size?: "sm" | "md" | "lg" | "xl";
    /** Закрывать ли при клике по оверлею (по умолчанию true) */
    closeOnOverlayClick?: boolean;
}

const sizeClasses: Record<NonNullable<AppModalProps["size"]>, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
        className={sizeClasses[size]}
        // Если не хотим закрытия по клику на оверлей — блокируем pointer-events на крестике Radix'а
        onPointerDownOutside={(e) => {
            if (!closeOnOverlayClick) e.preventDefault();
        }}
        >
        {title && (
            <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
                <DialogDescription>{description}</DialogDescription>
            )}
            </DialogHeader>
        )}

        {/* Контент. Отдельный div, чтобы паддинг не конфликтовал с хедером/футером */}
        <div className="py-2">{children}</div>

        {footer && (
            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
            {footer}
            </div>
        )}
        </DialogContent>
        </Dialog>
    );
}
