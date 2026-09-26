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

  // const handleAddBoard = async (title: string) => {
  //   const res = await api.createBoard(title);
  //   if (res.status === "ok") {
  //     const newRes = await api.getBoards();
  //     if (newRes.status === "ok" && newRes.data.boards.length > 0) {
  //       setBoards(newRes.data.boards);
  //       const newBoard = newRes.data.boards.find(b => b.title === title);
  //       if (newBoard) {
  //         setSelectedBoardId(newBoard.id);
  //       } else {
  //         setSelectedBoardId(newRes.data.boards[newRes.data.boards.length - 1].id);
  //       }
  //     }
  //     setAddBoardModalOpen(false);
  //   }
  // };

  // const handleAddBoard = async (title: string) => {
  //   const res = await api.createBoard(title);
  //   if (res.status === "ok") {
  //     setBoards(prev => [...prev, res.data.board]);
  //     setSelectedBoardId(res.data.board.id);
  //     setAddBoardModalOpen(false);
  //   }
  // };


  const handleAddBoard = async (title: string): Promise<{ ok: boolean; message?: string }> => {
    const res = await api.createBoard(title);
    if (res.status !== "ok") {
      return { ok: false, message: res.message };
    }
    setBoards(prev => [...prev, res.data.board]);
    setSelectedBoardId(res.data.board.id);
    return { ok: true };
  };
  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm("Удалить доску со всеми колонками и карточками?")) return;

    const res = await api.deleteBoard(boardId);
    if (res.status !== "ok") return;

    const remaining = boards.filter(b => b.id !== boardId);
    setBoards(remaining);
    if (selectedBoardId === boardId) {
      setSelectedBoardId(remaining[0]?.id ?? null);
    }
  };

  // const handleAddColumn = async (boardId: string, title: string) => {
  //   const res = await api.createColumn(boardId, title);
  //   if (res.status === "ok") {
  //     const newRes = await api.getBoards();
  //     if (newRes.status === "ok") {
  //       setBoards(newRes.data.boards);
  //     }
  //   }
  // };

  const handleAddColumn = async (boardId: string, title: string) => {
    const res = await api.createColumn(boardId, title);
    if (res.status === "ok") {
      setBoards(prev => prev.map(b =>
          b.id === boardId
              ? { ...b, columns: [...b.columns, res.data.column] }
              : b,
      ));
    }
  };

  // const handleDeleteColumn = async (boardId: string, columnId: string) => {
  //   if (!confirm("Вы уверены, что хотите удалить эту колонку?")) return;
  //
  //   const res = await api.deleteColumn(boardId, columnId);
  //   if (res.status === "ok") {
  //     const newRes = await api.getBoards();
  //     if (newRes.status === "ok") {
  //       setBoards(newRes.data.boards);
  //     }
  //   }
  // };

  const handleDeleteColumn = async (boardId: string, columnId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту колонку?")) return;

    const res = await api.deleteColumn(boardId, columnId);
    if (res.status === "ok") {
      setBoards(prev => prev.map(b =>
          b.id === boardId
              ? { ...b, columns: b.columns.filter(c => c.id !== columnId) }
              : b,
      ));
    }
  };

  const handleAddCard = async (
      boardId: string,
      columnId: string,
      title: string,
      description: string,
  ) => {
    const res = await api.createCard(boardId, columnId, title, description);
    if (res.status !== "ok") return;

    setBoards(prev => prev.map(b =>
        b.id === boardId
            ? {
              ...b,
              columns: b.columns.map(c =>
                  c.id === columnId
                      ? { ...c, cards: [...c.cards, res.data.card] }
                      : c,
              ),
            }
            : b,
    ));
  };

  const handleMoveCard = async (
      boardId: string,
      cardId: string,
      targetColumnId: string,
  ) => {
    const res = await api.moveCard(boardId, cardId, targetColumnId);
    if (res.status !== "ok") return;

    setBoards(prev => prev.map(b => {
      if (b.id !== boardId) return b;
      const card = b.columns
          .flatMap(c => c.cards)
          .find(x => x.id === cardId);
      if (!card) return b;
      return {
        ...b,
        columns: b.columns.map(c => {
          if (c.cards.some(x => x.id === cardId)) {
            return { ...c, cards: c.cards.filter(x => x.id !== cardId) };
          }
          if (c.id === targetColumnId) {
            return { ...c, cards: [...c.cards, card] };
          }
          return c;
        }),
      };
    }));
  };

  const handleDeleteCard = async (boardId: string, cardId: string) => {
    if (!confirm("Удалить карточку?")) return;

    const res = await api.deleteCard(boardId, cardId);
    if (res.status !== "ok") return;

    setBoards(prev => prev.map(b =>
        b.id === boardId
            ? {
              ...b,
              columns: b.columns.map(c => ({
                ...c,
                cards: c.cards.filter(card => card.id !== cardId),
              })),
            }
            : b,
    ));
  };

  const currentBoard = boards.find(board => board.id === selectedBoardId) || null;

  return (
    <main className={styles.workSessionPage}>
      <div className={styles.boardHeader}>
        <h1> Мои доски</h1>
        <button
          onClick={() => setAddBoardModalOpen(true)}
          className={styles.addBoardButton}
        >
          + Новая доска
        </button>
      </div>

      {boards.length > 1 && (
        <div className={styles.boardSelector}>
          <label className={styles.boardSelectorLabel} htmlFor="board-select">Выберите доску:</label>
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

          <button
              onClick={() => selectedBoardId && handleDeleteBoard(selectedBoardId)}
              className={styles.deleteBoardButton}
              disabled={!selectedBoardId}
              title="Удалить текущую доску"
          >
            <h3>Удалить доску</h3>
          </button>
        </div>
      )}

      {/*{currentBoard ? (*/}
      {/*  <KanbanBoard */}
      {/*    board={currentBoard} */}
      {/*    onAddColumn={handleAddColumn}*/}
      {/*    onDeleteColumn={handleDeleteColumn}*/}
      {/*  />*/}
      {/*) : (*/}
      {/*  <div className={styles.noBoard}>Нет доступных досок</div>*/}
      {/*)}*/}

      {currentBoard ? (
          // <KanbanBoard
          //     board={currentBoard}
          //     onAddColumn={(title) => handleAddColumn(currentBoard.id, title)}
          //     onDeleteColumn={(columnId) => handleDeleteColumn(currentBoard.id, columnId)}
          //     onAddCard={(columnId, title, description) =>
          //         handleAddCard(currentBoard.id, columnId, title, description)
          //     }
          //     onDeleteCard={(cardId) => handleDeleteCard(currentBoard.id, cardId)}
          // />
          <KanbanBoard
              board={currentBoard}
              onAddColumn={(title) => handleAddColumn(currentBoard.id, title)}
              onDeleteColumn={(columnId) => handleDeleteColumn(currentBoard.id, columnId)}
              onAddCard={(columnId, title, description) =>
                  handleAddCard(currentBoard.id, columnId, title, description)
              }
              onMoveCard={(cardId, targetColumnId) =>
                  handleMoveCard(currentBoard.id, cardId, targetColumnId)
              }
              onDeleteCard={(cardId) => handleDeleteCard(currentBoard.id, cardId)}
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