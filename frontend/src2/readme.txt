src/
├── core/                  # 🔵 Ядро (минимум)
│   ├── types/             # TypeScript типы / JS JSDoc
│   ├── api/               # API-клиент (axios instance, endpoints)
│   └── constants/         # Глобальные константы (STATUSES, ROUTES)
│
├── features/              # 🟢 Фичи (основная работа)
│   ├── kanban/
│   │   ├── components/    # Компоненты фичи (TaskCard, Column)
│   │   ├── hooks/         # Локальные хуки (useTaskMove)
│   │   └── api/           # Эндпоинты фичи (getTasks, updateTask)
│   └── auth/
│
├── shared/                # ⚪ Переиспользуемое
│   ├── ui/                # Кнопки, инпуты, модалки (UI-кит)
│   ├── hooks/             # Глобальные хуки (useAuth, useLocalStorage)
│   └── utils/             # formatDistance, validateEmail
│
├── app/                   # 🟠 Сборка
│   ├── router.jsx         # Роутинг
│   ├── providers.jsx      # Context/Redux провайдеры
│   └── layout.jsx         # Глобальный лейаут
│
├── pages/                 # 🟡 Страницы
│   ├── HomePage/
│   ├── BoardPage/
│   └── LoginPage/
│
└── main.jsx               # Точка входа
