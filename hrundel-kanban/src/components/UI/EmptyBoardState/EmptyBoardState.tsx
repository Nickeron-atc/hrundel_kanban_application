import { useState } from "react";
import styles from "./EmptyBoardState.module.css";
import hrundel from "../../../assets/hrundel.svg";
import CreateBoardModal from "../../Features/CreateBoardModal/CreateBoardModal";
import { api } from "../../../services/api";
import { useBoards } from "../../../contexts/BoardContext";

export default function EmptyBoardState() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const { reloadBoards, setCurrentBoardId } = useBoards();

    const handleCreateBoard = async (title: string) => {
        const res = await api.createBoard(title);
        if (res.status === "ok" && res.data?.board?.id) {
            const newBoardId = res.data.board.id;
            setCurrentBoardId(newBoardId);
            await reloadBoards();
            setCreateModalOpen(false);
            return { ok: true };
        }
        return { ok: false, message: res.message || "Не удалось создать доску" };
    };

    return (
        <>
            <div className={styles.overlay}>
                <div className={styles.card}>
                    <img src={hrundel} alt="" className={styles.icon} />
                    <h2 className={styles.title}>Нет доступных досок</h2>
                    <p className={styles.description}>
                        Создайте свою первую доску или присоединитесь к существующей
                    </p>
                    <button
                        className={styles.createButton}
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Создать доску
                    </button>
                </div>
            </div>
            <CreateBoardModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreateBoard={handleCreateBoard}
            />
        </>
    );
}
