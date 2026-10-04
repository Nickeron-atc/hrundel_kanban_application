// src/components/Features/CardDetailsModal/CardDetailsModal.tsx
import { useState } from "react";
import { AppModal } from "../../UI/AppModal/AppModal";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import UserAvatar from "../../UI/UserAvatar/UserAvatar";
import { ColorPickerModal } from "../../UI/ColorPickerModal/ColorPickerModal";
import { TagsModal } from "../../UI/TagsModal/TagsModal";
import Badge from "../../UI/Badge/Badge";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface CardDetails {
    id: string;
    title: string;
    description: string;
    color: string;
    tags: Tag[];
    creator: {
        name: string;
        avatarUrl: string;
    };
}

interface CardDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    card: CardDetails;
    onSave: (updates: Partial<CardDetails>) => Promise<void>;
    availableTags: Tag[];
    onCreateTag: (name: string, color: string) => Promise<Tag>;
}

export function CardDetailsModal({
                                     open,
                                     onOpenChange,
                                     card,
                                     onSave,
                                     availableTags,
                                     onCreateTag,
                                 }: CardDetailsModalProps) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);
    const [color, setColor] = useState(card.color);
    const [tags, setTags] = useState(card.tags);
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [tagsModalOpen, setTagsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave({ title, description, color, tags });
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save card:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppModal
                open={open}
                onOpenChange={onOpenChange}
                title="Детали карточки"
                size="md"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={loading}>
                            {loading ? "Сохранение..." : "Сохранить"}
                        </Button>
                    </>
                }
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Создатель */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--color-bg)", borderRadius: "var(--radius)" }}>
                        <UserAvatar src={card.creator.avatarUrl} name={card.creator.name} size="md" showName={true} />
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Создатель</div>
                    </div>

                    {/* Название */}
                    <Input
                        label="Название"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    {/* Описание */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-muted)" }}>
                            Описание
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Добавьте описание..."
                            style={{
                                width: "100%",
                                minHeight: "100px",
                                padding: "10px 14px",
                                fontSize: "14px",
                                fontFamily: "var(--font)",
                                color: "var(--color-text)",
                                background: "var(--color-surface)",
                                border: "1.5px solid var(--color-border)",
                                borderRadius: "var(--radius)",
                                outline: "none",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    {/* Цвет */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-muted)" }}>
                            Цвет
                        </label>
                        <button
                            onClick={() => setColorPickerOpen(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 14px",
                                border: "1.5px solid var(--color-border)",
                                borderRadius: "var(--radius)",
                                background: "var(--color-surface)",
                                cursor: "pointer",
                                width: "100%",
                            }}
                        >
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "var(--radius-sm)",
                                    background: color || "linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)",
                                    backgroundSize: color ? "auto" : "6px 6px",
                                    backgroundPosition: color ? "auto" : "0 0, 3px 3px",
                                    border: "1px solid var(--color-border)",
                                }}
                            />
                            <span style={{ fontSize: "14px", color: "var(--color-text)" }}>
                {color || "Без цвета"}
              </span>
                        </button>
                    </div>

                    {/* Теги */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-muted)" }}>
                            Теги
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                            {tags.map((tag) => (
                                <Badge key={tag.id} variant="primary">
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                        <Button variant="secondary" onClick={() => setTagsModalOpen(true)}>
                            {tags.length > 0 ? "Изменить теги" : "Добавить теги"}
                        </Button>
                    </div>
                </div>
            </AppModal>

            <ColorPickerModal
                open={colorPickerOpen}
                onOpenChange={setColorPickerOpen}
                selectedColor={color}
                onColorSelect={setColor}
            />

            <TagsModal
                open={tagsModalOpen}
                onOpenChange={setTagsModalOpen}
                selectedTags={tags}
                onTagsChange={setTags}
                availableTags={availableTags}
                onCreateTag={onCreateTag}
            />
        </>
    );
}