// src/components/Features/UserProfileModal/UserProfileModal.tsx
import { useState } from "react";
import { AppModal } from "../../UI/AppModal/AppModal";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import UserAvatar from "../../UI/UserAvatar/UserAvatar";
import moisey from "../../../assets/moisey.png";
import styles from "./UserProfileModal.module.css";
import { useBoards } from "../../../contexts/BoardContext";


interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
    const [nickname] = useState("@hrundel_user");
    const [login] = useState("hrundel_login");
    const [name, setName] = useState("Хрюндель Моисеевич");
    const avatarUrl = moisey; // <-- Исправлена опечатка с ");"

    const [originalName] = useState("Хрюндель Моисеевич");
    const hasChanges = name !== originalName;

    const [friendBoards, setFriendBoards] = useState([
        { id: "fb1", title: "Доска друга 1", owner: "Друг 1" },
        { id: "fb2", title: "Доска друга 2", owner: "Друг 2" },
    ]);

    const { boards } = useBoards();

    const handleApply = () => {
        console.log("Применяем изменения:", { name });
    };

    const handleCancel = () => {
        setName(originalName);
    };

    const handleRemoveFriendBoard = (boardId: string) => {
        setFriendBoards(friendBoards.filter((b) => b.id !== boardId));
    };

    return (
        <AppModal
            open={open}
            onOpenChange={onClose}
            title="Профиль пользователя"
            size="md"
            footer={
                hasChanges ? (
                    <>
                        <Button variant="ghost" onClick={handleCancel}>Отмена</Button>
                        <Button variant="primary" onClick={handleApply}>Применить</Button>
                    </>
                ) : null
            }
        >
            <div className={styles.profileContent}>
                {/* Аватарка */}
                <div className={styles.avatarSection}>
                    <UserAvatar src={avatarUrl} name={name} size="xl" showName={false} />
                </div>

                {/* Никнейм */}
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Никнейм</label>
                    <div className={styles.readOnlyField}>{nickname}</div>
                </div>

                {/* Логин */}
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Логин</label>
                    <div className={styles.readOnlyField}>{login}</div>
                </div>

                {/* Имя */}
                <div className={styles.fieldGroup}>
                    <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                {/* Пароль */}
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Пароль</label>
                    <div className={styles.readOnlyField}>Хрюндель его знает</div>
                </div>

                {/* Список своих досок */}
                <div className={styles.boardsSection}>
                    <h3 className={styles.sectionTitle}>Мои доски</h3>
                    {boards.length === 0 ? (
                        <div className={styles.emptyState}>У вас пока нет своих досок</div>
                    ) : (
                        <div className={styles.boardsList}>
                            {boards.map((board) => (
                                <div key={board.id} className={styles.boardItem}>
                                    <div>
                                        <div className={styles.boardTitle}>{board.title}</div>
                                        <div className={styles.boardOwner}>Владелец: Вы</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Доски друзей (перенесено внутрь profileContent для корректного gap) */}
                <div className={styles.boardsSection}>
                    <h3 className={styles.sectionTitle}>Доски друзей</h3>
                    {friendBoards.length === 0 ? (
                        <div className={styles.emptyState}>Нет доступных досок друзей</div>
                    ) : (
                        <div className={styles.boardsList}>
                            {friendBoards.map((board) => (
                                <div key={board.id} className={styles.boardItem}>
                                    <div>
                                        <div className={styles.boardTitle}>{board.title}</div>
                                        <div className={styles.boardOwner}>Владелец: {board.owner}</div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFriendBoard(board.id)}
                                        className={styles.removeButton}
                                        title="Удалить из списка"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppModal>
    );
}