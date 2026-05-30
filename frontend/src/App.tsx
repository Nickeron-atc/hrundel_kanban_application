import React from 'react';
// import logo from './logo.svg';
import './App.css';
// import Navbar from "./components/UI/Navbar/Navbar";
// import AppRouter from "./components/AppRouter";

// import './App.css';

function App() {
    return (
        <div className="app">
            {/* Шапка */}
            <header className="app-header">
                <h1>📋 Kanban Board</h1>
            </header>

            {/* Основной контент */}
            <main className="app-main">
                {/* Колонки */}
                <div className="board">

                    {/* Колонка: Нужно сделать */}
                    <div className="column">
                        <h2>📝 To Do yoptit</h2>
                        <div
    onDragEnter={e => console.log('onDragEnter')}
    onDragLeave={e => console.log('onDragLeave')}
    onDragOver={e => { e.preventDefault(); console.log('onDragOver'); }}
    onDrop={e => console.log('onDrop')}
   className="task-card">
                            <h3>Задача 1</h3>
                            <p>Описание задачи...</p>

                        </div>
                        <div className="task-card">
                            <h3>Задача 2</h3>
                            <p>Описание задачи...</p>
                        </div>
                    </div>

                    {/* Колонка: В работе */}
                    <div className="column">
                        <h2>🔄 In Progress</h2>
                        <div className="task-card">
                            <h3>Задача 3</h3>
                            <p>Описание задачи...</p>
                        </div>
                    </div>

                    {/* Колонка: Готово */}
                    <div className="column">
                        <h2>✅ Done</h2>
                        <div className="task-card">
                            <h3>Задача 4</h3>
                            <p>Описание задачи...</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
