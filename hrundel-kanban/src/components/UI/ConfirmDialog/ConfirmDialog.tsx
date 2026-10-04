// src/components/UI/ConfirmDialog/ConfirmDialog.tsx
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
} from "../../ui/alert-dialog"; // Было: @/components/ui/alert-dialog
import { cn } from "../../../lib/utils"; // Было: @/lib/utils

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