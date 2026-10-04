// src/components/Features/CreateBoardModal/CreateBoardModal.tsx
// Модальное окно создания доски с выбором: создать свою или присоединиться по ссылке.
// Заменяет старый AddBoardModal.
import { useState } from "react";
import { AppModal } from "../../UI/AppModal/AppModal";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";

type ModalStep = "choice" | "create" | "join";

interface CreateBoardModalProps {
    open: boolean;
    onClose: () => void;
    onCreateBoard: (title: string) => Promise<{ ok: boolean; message?: string }>;
}

export default function CreateBoardModal({
                                             open,
                                             onClose,
                                             onCreateBoard,
                                         }: CreateBoardModalProps) {
    const [step, setStep] = useState<ModalStep>("choice");
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Сброс состояния при закрытии
    const handleClose = () => {
        setStep("choice");
        setTitle("");
        setLink("");
        setError("");
        setLoading(false);
        onClose();
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("Укажите название доски");
            return;
        }
        setLoading(true);
        setError("");
        const result = await onCreateBoard(title.trim());
        setLoading(false);
        if (!result.ok) {
            setError(result.message || "Не удалось создать доску");
            return;
        }
        handleClose();
    };

    const handleJoin = () => {
        // TODO: реализовать присоединение по ссылке
        if (!link.trim()) {
            setError("Вставьте ссылку на доску");
            return;
        }
        setError("Функция присоединения по ссылке пока в разработке");
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(isOpen) => !isOpen && handleClose()}
            title={
                step === "choice"
                    ? "Новая доска"
                    : step === "create"
                        ? "Создать доску"
                        : "Присоединиться к доске"
            }
            size="sm"
            footer={
                step === "choice" ? (
                    <Button variant="ghost" onClick={handleClose}>
                        Отмена
                    </Button>
                ) : (
                    <>
                        <Button variant="ghost" onClick={() => { setStep("choice"); setError(""); }}>
                            Назад
                        </Button>
                        {step === "create" && (
                            <Button variant="primary" onClick={handleCreate} disabled={loading}>
                                {loading ? "Создаём..." : "Создать"}
                            </Button>
                        )}
                        {step === "join" && (
                            <Button variant="primary" onClick={handleJoin} disabled={loading}>
                                Присоединиться
                            </Button>
                        )}
                    </>
                )
            }
        >
            {step === "choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                        onClick={() => setStep("create")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px 16px",
                            borderRadius: "var(--radius)",
                            border: "1.5px solid var(--color-border)",
                            background: "var(--color-surface)",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "border-color 0.15s, background 0.15s",
                            fontFamily: "var(--font)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                            e.currentTarget.style.background = "var(--color-primary-light)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-border)";
                            e.currentTarget.style.background = "var(--color-surface)";
                        }}
                    >
                        <span style={{ fontSize: "22px" }}>+</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text)" }}>
                                Создать свою доску
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                                Новая пустая доска для ваших задач
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setStep("join")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px 16px",
                            borderRadius: "var(--radius)",
                            border: "1.5px solid var(--color-border)",
                            background: "var(--color-surface)",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "border-color 0.15s, background 0.15s",
                            fontFamily: "var(--font)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-primary)";
                            e.currentTarget.style.background = "var(--color-primary-light)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--color-border)";
                            e.currentTarget.style.background = "var(--color-surface)";
                        }}
                    >
                        <span style={{ fontSize: "22px" }}>🔗</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--color-text)" }}>
                                Присоединиться по ссылке
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                                Подключиться к существующей доске
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {step === "create" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Input
                        label="Название доски"
                        placeholder="Введите название"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setError(""); }}
                        error={error}
                        autoFocus
                    />
                </div>
            )}

            {step === "join" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <Input
                        label="Ссылка на доску"
                        placeholder="Вставьте ссылку"
                        value={link}
                        onChange={(e) => { setLink(e.target.value); setError(""); }}
                        error={error}
                        autoFocus
                    />
                </div>
            )}
        </AppModal>
    );
}