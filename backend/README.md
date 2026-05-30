# Hrundel Kanban — Flask Backend

## Запуск (разработка)

```bash
pip install -r requirements.txt
python src/backend.py
```

Сервер запустится на `http://localhost:5000`.

## Запуск (продакшен)

```bash
pip install -r requirements.txt
gunicorn -w 4 -b 0.0.0.0:5000 src.backend:app
```

## Подключение реального бэкенда к фронтенду

1. Убедись, что Flask работает на порту `5000`.
2. Фронтенд в режиме разработки (`npm run dev`) автоматически проксирует `/api/*` → `http://localhost:5000` через Vite proxy.
3. В продакшене настрой Nginx так, чтобы `/api/*` проксировался на `http://localhost:5000`.

## Инструкция по сборке и preview фронтенда

```bash
# 1. Собери статику
cd artifacts/hrundel-kanban
npm run build         # или: pnpm --filter @workspace/hrundel-kanban run build

# 2. Запусти preview-сервер (раздаёт dist/public как статику)
npm run preview       # или: pnpm --filter @workspace/hrundel-kanban run preview
```

Preview-сервер использует тот же порт, что задан в переменной окружения `PORT`.
Запросы `/api/*` в preview-режиме **не** проксируются автоматически — нужен отдельный Nginx или запущенный Flask на порту 5000.

## Маршруты

| Метод  | Путь                        | Описание                   |
|--------|-----------------------------|----------------------------|
| POST   | /api/login                  | Авторизация                |
| POST   | /api/register               | Регистрация                |
| GET    | /api/boards                 | Список досок с карточками  |
| PATCH  | /api/boards/<id>/cards      | Перемещение карточки       |
| POST   | /api/auth/logout            | Выход из системы           |
