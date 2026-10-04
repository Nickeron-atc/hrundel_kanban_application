// src/components/UI/TagsModal/TagsModal.tsx
import { useState } from "react";
import { AppModal } from "../AppModal/AppModal";
import Input from "../Input/Input";
import Button from "../Button/Button";
import Badge from "../Badge/Badge";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface TagsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
    availableTags: Tag[];
    onCreateTag: (name: string, color: string) => Promise<Tag>;
}

export function TagsModal({
                              open,
                              onOpenChange,
                              selectedTags,
                              onTagsChange,
                              availableTags,
                              onCreateTag,
                          }: TagsModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#FF7A00");
    const [loading, setLoading] = useState(false);

    const filteredTags = availableTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleTag = (tag: Tag) => {
        const isSelected = selectedTags.some((t) => t.id === tag.id);
        if (isSelected) {
            onTagsChange(selectedTags.filter((t) => t.id !== tag.id));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        setLoading(true);
        try {
            const newTag = await onCreateTag(newTagName.trim(), newTagColor);
            onTagsChange([...selectedTags, newTag]);
            setNewTagName("");
            setIsCreating(false);
        } catch (err) {
            console.error("Failed to create tag:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onOpenChange}
            title="Теги"
            size="md"
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Input
                    placeholder="Поиск тегов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                    {filteredTags.map((tag) => {
                        const isSelected = selectedTags.some((t) => t.id === tag.id);
                        return (
                            <div
                                key={tag.id}
                                onClick={() => handleToggleTag(tag)}
                                style={{
                                    cursor: "pointer",
                                    opacity: isSelected ? 1 : 0.6,
                                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                                    transition: "all 0.15s",
                                }}
                            >
                                <Badge variant="primary">{tag.name}</Badge>
                            </div>
                        );
                    })}
                </div>

                {isCreating ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", background: "var(--color-bg)", borderRadius: "var(--radius)" }}>
                        <Input
                            placeholder="Название тега"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                            <input
                                type="color"
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                style={{ width: "40px", height: "40px", border: "none", cursor: "pointer" }}
                            />
                            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
                                <Button variant="primary" onClick={handleCreateTag} disabled={loading || !newTagName.trim()}>
                                    {loading ? "Создание..." : "Создать"}
                                </Button>
                                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                                    Отмена
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Button variant="secondary" onClick={() => setIsCreating(true)}>
                        + Создать новый тег
                    </Button>
                )}
            </div>
        </AppModal>
    );
}