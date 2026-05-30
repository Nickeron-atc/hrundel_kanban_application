import React, { useState } from "react";

import MyButton from "../components/UI/Button/MyButton.jsx";
import MyInput from "../components/UI/input/MyInput.jsx";
import MyModal from "../components/UI/MyModal/MyModal.jsx";
import Card from "../components/UI/card/Card.jsx";
import MySelect from "../components/UI/select/MySelect.jsx"

import KanbanApi from "../api/api.jsx"

import "../styles/WorkSession.css";

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "To Do",
      cards: [
        { id: 1, title: "Карточка 1", description: "Описание 1" },
        { id: 2, title: "Карточка 2", description: "Описание 2" },
        { id: 3, title: "Карточка 3", description: "Описание 3" },
        { id: 4, title: "Карточка 4", description: "Описание 4" },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      cards: [
        { id: 5, title: "Карточка 5", description: "Описание 5" },
        { id: 6, title: "Карточка 6", description: "Описание 6" },
        { id: 7, title: "Карточка 7", description: "Описание 7" },
      ],
    },
    {
      id: "done",
      title: "Done",
      cards: [{ id: 8, title: "Карточка 8" }],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalData, setModalData] = useState({
    columnId: null,
    title: "",
    description: "",
  });
  const [settingsData, setSettingsData] = useState({
    boardName: "Kanban Board",
    cardsPerPage: "10",
    enableNotifications: "true",
  });

  const openAddModal = (columnId) => {
    setModalData({ columnId, title: "", description: "" });
    setIsModalOpen(true);
  };

  const handleAddCard = () => {
    if (!modalData.columnId || !modalData.title.trim()) return;

    setColumns((prev) =>
      prev.map((col) =>
        col.id === modalData.columnId
          ? {
              ...col,
              cards: [
                ...col.cards,
                {
                  id: Date.now(),
                  title: modalData.title,
                  description: modalData.description || "НЕТ ОПИСАНИЯ",
                },
              ],
            }
          : col,
      ),
    );

    setIsModalOpen(false);
  };

  const handleSaveSettings = () => {
    console.log("Settings saved:", settingsData);
    setIsSettingsOpen(false);
  };

  const handleCardClick = (card) => {
    console.log("Card clicked:", card);
  };

  const getColumnCardCount = (columnId) => {
    const col = columns.find((c) => c.id === columnId);
    return col ? col.cards.length : 0;
  };

  return (
    <div className="KanbanBoard">
      <div className="KanbanBoard__header">
        <h1 className="KanbanBoard__title">{settingsData.boardName}</h1>
        <MyButton
          className="KanbanBoard__settings-btn"
          onClick={() => setIsSettingsOpen(true)}
        >
          Настройки
        </MyButton>
      </div>

      <div className="KanbanBoard__board">
        {columns.map((column) => (
          <div key={column.id} className="KanbanBoard__column">
            <div className="KanbanBoard__column-header">
              <div className="KanbanBoard__column-title-wrapper">
                <span className="KanbanBoard__column-title">
                  {column.title}
                </span>
                <span className="KanbanBoard__column-count">
                  {getColumnCardCount(column.id)}
                </span>
              </div>
              {/* <MyButton
                className="KanbanBoard__add-btn-small"
                onClick={() => openAddModal(column.id)}
              >
                +
              </MyButton>*/}
            </div>

            {column.cards.map((card) => (
             <Card card={card}
                key={card.id}
            >
            </Card>
             
            ))}

            <MyButton
              className="KanbanBoard__add-btn"
              onClick={() => openAddModal(column.id)}
            >

            

              + Добавить задачу
            </MyButton>

          </div>
        ))}
      </div>

      <MyModal
        visible={isModalOpen}
        setVisible={setIsModalOpen}
        className="KanbanBoard__modal"
      >
        <div className="KanbanBoard__modal-content">
          <h3 className="KanbanBoard__modal-title">Новая задача</h3>

          <div className="KanbanBoard__form-group">
            <label className="KanbanBoard__label">Название *</label>
            <MyInput
              className="KanbanBoard__input"
              value={modalData.title}
              onChange={(e) =>
                setModalData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Введите название задачи"
            />
          </div>

          <div className="KanbanBoard__form-group">
            <label className="KanbanBoard__label">Описание</label>
            <MyInput
              className="KanbanBoard__input"
              value={modalData.description}
              onChange={(e) =>
                setModalData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Краткое описание (опционально)"
            />
          </div>

          <div className="KanbanBoard__modal-actions">
            <MyButton
              className="KanbanBoard__btn-cancel"
              onClick={() => setIsModalOpen(false)}
            >
              Отмена
            </MyButton>
            <MyButton className="KanbanBoard__btn-save" onClick={handleAddCard}>
              Добавить
            </MyButton>
          </div>
        </div>
      </MyModal>

      <MyModal
        visible={isSettingsOpen}
        setVisible={setIsSettingsOpen}
        className="KanbanBoard__modal"
      >
        <div className="KanbanBoard__modal-content">
          <h3 className="KanbanBoard__modal-title">Настройки доски</h3>

          <div className="KanbanBoard__form-group">
            <label className="KanbanBoard__label">Название доски</label>
            <MyInput
              className="KanbanBoard__input"
              value={settingsData.boardName}
              onChange={(e) =>
                setSettingsData((prev) => ({
                  ...prev,
                  boardName: e.target.value,
                }))
              }
              placeholder="Введите название"
            />
          </div>

          <div className="KanbanBoard__modal-actions">
            <MyButton
              className="KanbanBoard__btn-cancel"
              onClick={() => setIsSettingsOpen(false)}
            >
              Отмена
            </MyButton>
            <MyButton
              className="KanbanBoard__btn-save"
              onClick={handleSaveSettings}
            >
              Сохранить
            </MyButton>
          </div>
        </div>
      </MyModal>
    </div>
  );
};

export default KanbanBoard;
