import { useState, useEffect } from "react";
import { AppModal } from "../../UI/AppModal/AppModal";
import Button from "../../UI/Button/Button";
import { api } from "../../../services/api";

interface ShareBoardModalProps {
    open: boolean;
    onClose: () => void;
    boardId: string;
    boardTitle: string;
}

export default function ShareBoardModal({ open, onClose, boardId, boardTitle }: ShareBoardModalProps) {
    const [shareUrl, setShareUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open && boardId) {
            setLoading(true);
            api.getShareLink(boardId).then((res) => {
            if (res.status === "ok") {
                // setShareUrl(`${window.location.origin}/join/${res.data.share_token}`);
                setShareUrl(`http://26.19.204.168:5173/join/${res.data.share_token}`);
            }
            setLoading(false);
        });
        }
    }, [open, boardId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={(isOpen) => !isOpen && onClose()}
            title={`Поделиться доской "${boardTitle}"`}
            size="md"
            footer={
                <Button variant="ghost" onClick={onClose}>
                    Закрыть
                </Button>
            }
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>
                        Загрузка...
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
                            Отправьте эту ссылку другим пользователям, чтобы они могли присоединиться к доске:
                        </div>
                        <div
                            style={{
                                padding: "12px 16px",
                                background: "var(--color-bg)",
                                border: "1.5px solid var(--color-border)",
                                borderRadius: "var(--radius)",
                                fontSize: "14px",
                                color: "var(--color-text)",
                                wordBreak: "break-all",
                                fontFamily: "monospace",
                            }}
                        >
                            {shareUrl}
                        </div>
                        <Button variant="primary" onClick={handleCopy}>
                            {copied ? "Скопировано!" : "Копировать ссылку"}
                        </Button>
                    </>
                )}
            </div>
        </AppModal>
    );
}
