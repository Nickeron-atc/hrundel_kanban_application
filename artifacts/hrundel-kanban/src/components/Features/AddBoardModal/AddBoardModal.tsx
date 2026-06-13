// src/components/Features/AddBoardModal/AddBoardModal.tsx
import { useState } from "react";
import Input from "../../../components/UI/Input/Input";
import Button from "../../../components/UI/Button/Button";
import Modal from "../../../components/UI/Modal/Modal";

interface AddBoardModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string) => Promise<void>;
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
    try {
      await onAdd(title.trim());
      setTitle("");
      onClose();
    } catch (err) {
      setError((err as Error).message || "Не удалось создать доску");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Создать доску">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Input
          label="Название доски"
          placeholder="Введите название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
        />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Создаём..." : "Создать"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}