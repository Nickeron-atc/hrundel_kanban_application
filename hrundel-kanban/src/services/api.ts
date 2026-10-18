export interface ApiResponse<T = unknown> {
  status: "ok" | "error";
  data: T;
  message?: string;
}

// export interface Card {
//   id: string;
//   title: string;
//   description: string;
// }

// export interface Card {
//   id: string;
//   title: string;
//   description: string;
//   columnId?: string;
// }

// src/services/api.ts - добавляем новые методы

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId?: string;
  color?: string;
  tags?: Tag[];
}

// В объект api добавляем новые методы:


export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

/** Выполнить HTTP-запрос и нормализовать ответ в ApiResponse. */
async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const token = auth.getToken();
    
    // Используем Headers вместо простого объекта
    const headers = new Headers(options?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`/api${path}`, { 
      ...options, 
      headers 
    });

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { status: "error", data: null as T, message: `HTTP ${res.status}: invalid JSON` };
    }

    if (!res.ok) {
      const msg =
        typeof json === "object" && json !== null && "message" in json
          ? String((json as { message: unknown }).message)
          : `HTTP ${res.status}`;
      return { status: "error", data: null as T, message: msg };
    }

    // Если сервер уже вернул { status, data } — пробрасываем напрямую
    if (
      typeof json === "object" &&
      json !== null &&
      "status" in json
    ) {
      return json as ApiResponse<T>;
    }

    return { status: "ok", data: json as T };
  } catch (err) {
    return {
      status: "error",
      data: null as T,
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}

export const api = {
  /** POST /api/login — { login, password } → { auth_token } */
  login(login: string, password: string): Promise<ApiResponse<{ auth_token: string }>> {
    return request("/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });
  },

  /** POST /api/register — { login, password, fullName } → { status } */
  register(login: string, password: string, fullName: string): Promise<ApiResponse<{ status: string }>> {
    return request("/register", {
      method: "POST",
      body: JSON.stringify({ login, password, fullName }),
    });
  },

  /** GET /api/boards → { boards: Board[] } */
  getBoards(): Promise<ApiResponse<{ boards: Board[] }>> {
    return request("/boards");
  },
  // /** POST /api/boards — { name } → { board: Board } */
  // createBoard(name: string): Promise<ApiResponse<{ board: Board }>> {
  //   return request("/boards", {
  //     method: "POST",
  //     body: JSON.stringify({ name }),
  //   });
  // },

  createBoard(title: string): Promise<ApiResponse<{ board: Board }>> {
    return request("/boards", {
      method: "POST",
      body: JSON.stringify({ title }), // Изменено с { name } на { title }
    });
  },

  /** DELETE /api/boards/:boardId */
  deleteBoard(boardId: string): Promise<ApiResponse<{ deleted: string }>> {
    return request(`/boards/${boardId}`, { method: "DELETE" });
  },

  /** POST /api/boards/:boardId/columns/:columnId/cards — { title, description } → { card } */
  createCard(
      boardId: string,
      columnId: string,
      title: string,
      description: string,
  ): Promise<ApiResponse<{ card: Card }>> {
    return request(`/boards/${boardId}/columns/${columnId}/cards`, {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },

  /** DELETE /api/boards/:boardId/cards/:cardId */
  deleteCard(
      boardId: string,
      cardId: string,
  ): Promise<ApiResponse<{ deleted: string }>> {
    return request(`/boards/${boardId}/cards/${cardId}`, {
      method: "DELETE",
    });
  },

  // /** PATCH /api/boards/:boardId/cards — переместить карточку */
  // moveCard(
  //   boardId: string,
  //   cardId: string,
  //   targetColumnId: string,
  // ): Promise<ApiResponse<{ status: string }>> {
  //   return request(`/boards/${boardId}/cards`, {
  //     method: "PATCH",
  //     body: JSON.stringify({ cardId, targetColumnId }),
  //   });
  // },

  /** PATCH /api/boards/:boardId/cards — переместить карточку */
  // moveCard(
  //     boardId: string,
  //     cardId: string,
  //     targetColumnId: string,
  // ): Promise<ApiResponse<{ cardId: string; targetColumnId: string }>> {
  //   return request(`/boards/${boardId}/cards`, {
  //     method: "PATCH",
  //     body: JSON.stringify({ cardId, targetColumnId }),
  //   });
  // },

    moveCard(
    boardId: string,
    cardId: string,
    targetColumnId: string,
  ): Promise<ApiResponse<{ cardId: string; targetColumnId: string }>> {
    return request("/cards/move", {
      method: "POST",
      body: JSON.stringify({
        card_id: parseInt(cardId, 10),
        target_column_id: parseInt(targetColumnId, 10),
        board_id: parseInt(boardId, 10),
      }),
    });
  },

    updateCard(
    boardId: string,
    cardId: string,
    updates: { title?: string; description?: string; color?: string; tags?: { id: string }[] }
  ): Promise<ApiResponse<{ card: Card }>> {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.tags !== undefined) {
      payload.tagIds = updates.tags.map((t) => parseInt(t.id, 10));
    }
    return request(`/boards/${boardId}/cards/${cardId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getTags(boardId: string): Promise<ApiResponse<{ tags: Tag[] }>> {
return request(`/boards/${boardId}/tags`);
},

  createTag(boardId: string, name: string, color: string): Promise<ApiResponse<{ tag: Tag }>> {
    return request(`/boards/${boardId}/tags`, {
    method: "POST",
    body: JSON.stringify({ name, color }),
    });
  },

  deleteTag(tagId: string): Promise<ApiResponse<{ deleted: string }>> {
    return request(`/tags/${tagId}`, { method: "DELETE" });
  },

  getMe(): Promise<ApiResponse<{ user: { id: number; login: string; full_name: string; has_avatar: boolean } }>> {
    return request("/me");
  },

  updateProfile(userId: string, data: { full_name?: string }): Promise<ApiResponse<{ user: unknown }>> {
    return request(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  },

  uploadAvatar(userId: string, file: File): Promise<ApiResponse<{ ok: boolean }>> {
    const formData = new FormData();
    formData.append("avatar", file);
    return request(`/users/${userId}/avatar`, {
    method: "POST",
    body: formData,
    headers: {},
    });
  },

  deleteAvatar(userId: string): Promise<ApiResponse<{ ok: boolean }>> {
    return request(`/users/${userId}/avatar`, { method: "DELETE" });
  },

  /** POST /api/auth/logout */
  logout(): Promise<ApiResponse<{ status: string }>> {
    return request("/auth/logout", { method: "POST" });
  },
  /** POST /api/boards/:boardId/columns — { title } → { column: Column } */
  createColumn(boardId: string, title: string): Promise<ApiResponse<{ column: Column }>> {
    return request(`/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },


  /** DELETE /api/boards/:boardId/columns/:columnId */
  deleteColumn(boardId: string, columnId: string): Promise<ApiResponse<{ deleted: string }>> {
    return request(`/boards/${boardId}/columns/${columnId}`, {
      method: "DELETE",
    });
  },
};

export const auth = {
  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },
  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },
  clearToken(): void {
    localStorage.removeItem("auth_token");
  },
  isLoggedIn(): boolean {
    return !!localStorage.getItem("auth_token");
  },
};
