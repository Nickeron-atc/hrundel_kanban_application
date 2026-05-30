// api/kanbanApi.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class KanbanApi {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Добавление токена авторизации (если нужен)
  setAuthToken(token) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  // Обработка ошибок
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Отправка полного состояния доски
  async saveBoard(boardData) {
    try {
      const response = await fetch(`${this.baseUrl}/boards`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          board: boardData,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error saving board:', error);
      throw error;
    }
  }

  // Отправка изменений доски (инкрементальное обновление)
  async sendBoardChanges(changes) {
    try {
      const response = await fetch(`${this.baseUrl}/board/changes`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          changes: changes,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error sending board changes:', error);
      throw error;
    }
  }

  // Создание новой карточки
  async createCard(cardData) {
    try {
      const response = await fetch(`${this.baseUrl}/cards`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          card: cardData,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  }

  // Обновление карточки
  async updateCard(cardId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/cards/${cardId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          updates: updates,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  // Перемещение карточки
  async moveCard(cardId, sourceColumn, destinationColumn, newIndex) {
    const changes = {
      type: 'MOVE_CARD',
      cardId: cardId,
      sourceColumn: sourceColumn,
      destinationColumn: destinationColumn,
      newIndex: newIndex,
    };
    
    return await this.sendBoardChanges(changes);
  }

  // Создание новой колонки
  async createColumn(columnData) {
    try {
      const response = await fetch(`${this.baseUrl}/columns`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          column: columnData,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    }
  }

  // Обновление колонки
  async updateColumn(columnId, updates) {
    try {
      const response = await fetch(`${this.baseUrl}/columns/${columnId}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          updates: updates,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating column:', error);
      throw error;
    }
  }

  // Перемещение колонки
  async moveColumn(columnId, newIndex) {
    const changes = {
      type: 'MOVE_COLUMN',
      columnId: columnId,
      newIndex: newIndex,
    };
    
    return await this.sendBoardChanges(changes);
  }

  // Удаление карточки
  async deleteCard(cardId) {
    try {
      const response = await fetch(`${this.baseUrl}/cards/${cardId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  // Удаление колонки
  async deleteColumn(columnId) {
    try {
      const response = await fetch(`${this.baseUrl}/columns/${columnId}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  }

  // Получение всех досок
  async getBoards() {
    try {
      const response = await fetch(`${this.baseUrl}/boards`, {
        method: 'GET',
        headers: this.headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  }

  // Получение конкретной доски
  async getBoard(boardId) {
    try {
      const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  }

  // Массовое обновление (синхронизация)
  async syncBoard(boardData) {
    try {
      const response = await fetch(`${this.baseUrl}/board/sync`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          board: boardData,
          version: boardData.version,
          timestamp: new Date().toISOString(),
        }),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error syncing board:', error);
      throw error;
    }
  }
}

// Создание экземпляра API
export const kanbanApi = new KanbanApi();

// Экспорт класса для возможности создания новых экземпляров
export default KanbanApi;
