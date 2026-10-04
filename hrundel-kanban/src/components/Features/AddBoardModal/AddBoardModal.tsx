// src/components/Features/AddBoardModal/AddBoardModal.tsx
import { useState } from "react";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";
import { AppModal } from "../../UI/AppModal/AppModal"; // Было: @/components/UI/AppModal/AppModal

interface AddBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string) => Promise<{ ok: boolean; message?: string }>;
}

export default function AddBoardModal({ visible, onClose, onAdd }: AddBoardModalProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Укажите название доски");
      return;
    }
    setLoading(true);
    setError("");
    const result = await onAdd(title.trim());
    setLoading(false);
    if (!result.ok) {
      setError(result.message || "Не удалось создать доску");
      return;
    }
    setTitle("");
    onClose();
  };

  return (
      <AppModal
          open={visible}
          onOpenChange={(open) => !open && onClose()}
          title="Создать доску"
          footer={
            <>
              <Button variant="ghost" onClick={onClose}>
                Отмена
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Создаём..." : "Создать"}
              </Button>
            </>
          }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
              label="Название доски"
              placeholder="Введите название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={error}
          />
        </div>
      </AppModal>
  );
}