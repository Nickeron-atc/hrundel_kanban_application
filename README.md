# Hrundel Kanban Application

## WHAT IS THIS ABOUT

Hrundel Kanban is a minimalist, production-ready Kanban board application designed for efficient task management. It features a clean, responsive user interface built with React and a robust backend powered by Flask and PostgreSQL. The entire stack is fully containerized using Docker, making it easy to deploy and run consistently across any environment.

Key Features:
- User Authentication: Secure registration and login with JWT tokens.
- Multiple Boards: Create, view, and switch between different Kanban boards.
- Drag and Drop: Native HTML5 drag-and-drop functionality to move cards between columns seamlessly.
- Board Management: Add new columns, delete columns, and manage tasks with ease.
- Responsive UI: Clean interface built with Tailwind CSS and shadcn/ui components.
- Production-Ready: Fully containerized with Docker, Nginx, and PostgreSQL.

## TECH STACK

Frontend:
- React 18, Vite, TypeScript
- Tailwind CSS, shadcn/ui (Radix primitives)
- React Router for navigation
- Framer Motion for animations

Backend:
- Flask (Python)
- PostgreSQL for persistent data storage
- SQLAlchemy (ORM)
- PyJWT for authentication
- Gunicorn for production serving

Infrastructure:
- Docker and Docker Compose for containerization
- Nginx as a reverse proxy and static file server

## HOW TO RUN

### Option 1: Docker (Recommended)
This is the fastest way to get the entire stack (Frontend, Backend, Database) running.

Prerequisites: Docker and Docker Compose installed.

1. Navigate to the root project directory:
   cd hrundel_kanban_application

2. Build and start the containers in the background:
   docker compose up -d --build
   (Note: If you get a permission denied error, prefix with sudo or add your user to the docker group).

3. Open your browser and visit:
   http://localhost

4. To view logs:
   docker compose logs -f

5. To stop the application:
   docker compose down

### Option 2: Local Development
If you want to modify the code and see changes instantly without rebuilding Docker images.

1. Start the Database:
   You need PostgreSQL running. You can use Docker just for the DB:
   ```bash
   docker run -d --name hrundel-db -e POSTGRES_USER=kanban -e POSTGRES_PASSWORD=kanban -e POSTGRES_DB=kanban -p 5432:5432 postgres:15-alpine
   ```

3. Start the Backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  (On Windows: venv\Scripts\activate)
   pip install -r requirements.txt
   export DATABASE_URL="postgresql://kanban:kanban@localhost:5432/kanban"
   export SECRET_KEY="dev-secret-key"
   python src/backend.py
   ```
   The Flask server will start on `http://localhost:5000`.

5. Start the Frontend:
   ```bash
   cd hrundel-kanban
   pnpm install
   pnpm run dev
   ```
   The Vite dev server will start on `http://localhost:5173`. It is configured to proxy all `/api/*` requests directly to the Flask backend.

## PROJECT STRUCTURE
```tree
hrundel_kanban_application/
├── docker-compose.yml          # Orchestrates frontend, backend, and database
├── db/                         # PostgreSQL initialization scripts
│   ├── Dockerfile              
│ └── init.sql                
├── backend/                    # Flask API
│   ├── Dockerfile              
│   ├── requirements.txt        
│   └── src/backend.py          
└── hrundel-kanban/             # React Frontend
├── Dockerfile              
├── nginx.conf              # Nginx config for production
├── package.json
└── src/
├── components/         # UI and Feature components
├── pages/              # Login, Register, WorkSession, etc.
└── services/api.ts     # API client
```

## USAGE

1. Register a new account on the registration page.
2. Log in with your credentials.
3. You will be redirected to the WorkSession page where you can see your Kanban boards.
4. Create a new board, add columns, and start dragging cards around!
