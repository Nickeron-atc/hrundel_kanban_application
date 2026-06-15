/**
 * Hrundel Kanban — API client.
 * Все методы возвращают Promise<ApiResponse<T>>.
 * Все запросы идут на /api/* и проксируются Vite-сервером на Flask (localhost:5000).
 */

export interface ApiResponse<T = unknown> {
  status: "ok" | "error";
  data: T;
  message?: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
}

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
  /** POST /api/boards — { name } → { board: Board } */
  createBoard(name: string): Promise<ApiResponse<{ board: Board }>> {
    return request("/boards", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
  /** PATCH /api/boards/:boardId/cards — переместить карточку */
  moveCard(
    boardId: string,
    cardId: string,
    targetColumnId: string,
  ): Promise<ApiResponse<{ status: string }>> {
    return request(`/boards/${boardId}/cards`, {
      method: "PATCH",
      body: JSON.stringify({ cardId, targetColumnId }),
    });
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
