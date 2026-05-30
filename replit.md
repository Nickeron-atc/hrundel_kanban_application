# Hrundel Kanban

Минималистичное Kanban-приложение для управления задачами с drag & drop, авторизацией и встроенными моками API.

## Run & Operate

- `pnpm --filter @workspace/hrundel-kanban run dev` — запустить фронтенд (через workflow)
- `pnpm --filter @workspace/api-server run dev` — запустить API-сервер
- `pnpm run typecheck` — полная проверка типов
- `pnpm run build` — сборка всех пакетов

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React 18 + Vite
- React Router DOM v6
- CSS Modules (полная изоляция стилей)
- HTML5 Drag & Drop (нативный, без библиотек)
- Встроенные моки API (без необходимости бэкенда)

## Where things live

- `artifacts/hrundel-kanban/src/services/api.ts` — API-клиент + моки (единственный источник истины)
- `artifacts/hrundel-kanban/src/components/UI/` — Button, Input, Modal, Badge, HrundelDecor
- `artifacts/hrundel-kanban/src/components/Features/` — Navbar, KanbanBoard, KanbanColumn, KanbanCard
- `artifacts/hrundel-kanban/src/pages/` — Login, Register, WorkSession, About, ErrorPage
- `artifacts/hrundel-kanban/src/assets/hrundel.svg` — SVG-силэт кабанчика (фоновый декор)
- `artifacts/hrundel-kanban/src/index.css` — CSS-переменные темы (цвета, радиусы, шрифты)

## Architecture decisions

- **CSS Modules** — каждый компонент изолирован, нет глобальных конфликтов стилей
- **Моки API** — `USE_MOCKS = true` в `api.ts`; при подключении бэкенда ставится `false`
- **Токен в localStorage** — `auth.ts` утилиты управляют токеном без сторонних библиотек
- **Drag & Drop** — HTML5 нативный, через `draggable` + `onDragStart`/`onDrop` на уровне KanbanBoard
- **Состояние доски** — хранится в `useState` на уровне KanbanBoard, синхронизируется с API

## Product

- Страница входа (`/login`) и регистрации (`/register`) с валидацией
- Kanban-доска (`/worksession`) с колонками To Do / In Progress / Done
- Добавление карточек через модальное окно
- Перетаскивание карточек между колонками
- Страница «О проекте» (`/about`)
- Минимализм: оранжевый `#FF7A00`, серый фон `#F4F6F8`, SVG кабанчика в углу

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Переключение на реальный бэкенд: `USE_MOCKS = false` в `artifacts/hrundel-kanban/src/services/api.ts`; бэкенд должен отвечать на `/api/login`, `/api/register`, `/api/boards`, `/api/boards/:id/cards`, `/api/auth/logout`
- CSS Modules: используй `.module.css` файл рядом с каждым компонентом

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
