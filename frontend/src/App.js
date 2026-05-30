import React from "react";
import { BrowserRouter } from "react-router-dom";

import Navbar from "./components/UI/Navbar/Navbar.jsx";
import AppRouter from "./components/AppRouter.jsx";
import "./styles/App.css";

function App(inputValue) {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRouter />
    </BrowserRouter>
  );
}

// import React from "react";
// import logo from './logo.svg';
// import "./App.css";

// function App() {
//   return (
//     <div className="app">
//       {/* Шапка */}
//       <header className="app-header">
//         <h1>📋 Kanban Boardddd</h1>
//       </header>

//       {/* Основной контент */}
//       <main className="app-main">
//         {/* Колонки */}
//         <div className="board">
//           {/* Колонка: Нужно сделать */}
//           <div className="column">
//             <h2>📝 To Do</h2>
//             <div className="task-card">
//               <h3>Задача 1</h3>
//               <p>Описание задачи...</p>
//             </div>
//             <div className="task-card">
//               <h3>Задача 2</h3>
//               <p>Описание задачи...</p>
//             </div>
//           </div>

//           {/* Колонка: В работе */}
//           <div className="column">
//             <h2>🔄 In Progress</h2>
//             <div className="task-card">
//               <h3>Задача 3</h3>
//               <p>Описание задачи...</p>
//             </div>
//           </div>

//           {/* Колонка: Готово */}
//           <div className="column">
//             <h2>✅ Done</h2>
//             <div className="task-card">
//               <h3>Задача 4</h3>
//               <p>Описание задачи...</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

export default App;

// export default App;
