import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api, Board } from "../../services/api";
import KanbanBoard from "../../components/Features/KanbanBoard/KanbanBoard";
import AddBoardModal from "../../components/Features/AddBoardModal/AddBoardModal";
import styles from "./WorkSession.module.css";

export default function WorkSession() {
  const navigate = useNavigate();
  const [addBoardModalOpen, setAddBoardModalOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Загрузка досок
  useEffect(() => {
    const loadBoards = async () => {
      const res = await api.getBoards();
      if (res.status === "ok" && res.data.boards.length > 0) {
        setBoards(res.data.boards);
        setSelectedBoardId(res.data.boards[0].id);
      }
    };
    loadBoards();
  }, []);

  const handleAddBoard = async (title: string) => {
    const res = await api.createBoard(title);
    if (res.status === "ok") {
      const newRes = await api.getBoards();
      if (newRes.status === "ok" && newRes.data.boards.length > 0) {
        setBoards(newRes.data.boards);
        const newBoard = newRes.data.boards.find(b => b.title === title);
        if (newBoard) {
          setSelectedBoardId(newBoard.id);
        } else {
          setSelectedBoardId(newRes.data.boards[newRes.data.boards.length - 1].id);
        }
      }
      setAddBoardModalOpen(false);
    }
  };

  const handleAddColumn = async (boardId: string, title: string) => {
    const res = await api.createColumn(boardId, title);
    if (res.status === "ok") {
      const newRes = await api.getBoards();
      if (newRes.status === "ok") {
        setBoards(newRes.data.boards);
      }
    }
  };

  // 🔥 ПЕРЕМЕЩЕНО ВНУТРЬ КОМПОНЕНТА
  const handleDeleteColumn = async (boardId: string, columnId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту колонку?")) return;
    
    const res = await api.deleteColumn(boardId, columnId);
    if (res.status === "ok") {
      const newRes = await api.getBoards();
      if (newRes.status === "ok") {
        setBoards(newRes.data.boards);
      }
    }
  };

  const currentBoard = boards.find(board => board.id === selectedBoardId) || null;

  return (
    <main className={styles.workSessionPage}>
      <div className={styles.boardHeader}>
        <h1>Мои доски</h1>
        <button 
          onClick={() => setAddBoardModalOpen(true)}
          className={styles.addBoardButton}
        >
          + Новая доска
        </button>
      </div>

      {boards.length > 1 && (
        <div className={styles.boardSelector}>
          <label htmlFor="board-select">Выберите доску:</label>
          <select
            id="board-select"
            value={selectedBoardId || ""}
            onChange={(e) => setSelectedBoardId(e.target.value)}
            className={styles.boardSelect}
          >
            {boards.map(board => (
              <option key={board.id} value={board.id}>
                {board.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {currentBoard ? (
        <KanbanBoard 
          board={currentBoard} 
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onBoardUpdate={(updatedBoards) => setBoards(updatedBoards)}
        />
      ) : (
        <div className={styles.noBoard}>Нет доступных досок</div>
      )}

      <AddBoardModal
        visible={addBoardModalOpen}
        onClose={() => setAddBoardModalOpen(false)}
        onAdd={handleAddBoard}
      />
    </main>
  );
}