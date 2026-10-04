// src/components/UI/ColorPickerModal/ColorPickerModal.tsx
import { AppModal } from "../AppModal/AppModal";
import { cn } from "@/lib/utils";

interface ColorPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

// Палитра цветов (можно расширить)
const COLOR_PALETTE = [
    { name: "Без цвета", value: "" },
    { name: "Красный", value: "#E74C3C" },
    { name: "Оранжевый", value: "#FF7A00" },
    { name: "Жёлтый", value: "#F1C40F" },
    { name: "Зелёный", value: "#27AE60" },
    { name: "Синий", value: "#3498DB" },
    { name: "Фиолетовый", value: "#9B59B6" },
    { name: "Розовый", value: "#E91E63" },
    { name: "Серый", value: "#95A5A6" },
];

export function ColorPickerModal({
                                     open,
                                     onOpenChange,
                                     selectedColor,
                                     onColorSelect,
                                 }: ColorPickerModalProps) {
    const handleColorClick = (color: string) => {
        onColorSelect(color);
        onOpenChange(false);
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Выберите цвет"
            size="sm"
        >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", padding: "8px" }}>
                {COLOR_PALETTE.map((color) => (
                    <button
                        key={color.value || "none"}
                        onClick={() => handleColorClick(color.value)}
                        title={color.name}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "var(--radius)",
                            border: selectedColor === color.value ? "3px solid var(--color-primary)" : "2px solid var(--color-border)",
                            background: color.value || "linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)",
                            backgroundSize: color.value ? "auto" : "10px 10px",
                            backgroundPosition: color.value ? "auto" : "0 0, 5px 5px",
                            cursor: "pointer",
                            transition: "transform 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    />
                ))}
            </div>
        </AppModal>
    );
}