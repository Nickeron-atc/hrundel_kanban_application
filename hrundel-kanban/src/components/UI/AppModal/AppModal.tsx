// src/components/UI/AppModal/AppModal.tsx
import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../ui/dialog"; // Было: @/components/ui/dialog

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