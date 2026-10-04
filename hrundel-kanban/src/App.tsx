// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Features/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import WorkSession from "./pages/WorkSession/WorkSession";
import About from "./pages/About/About";
import ErrorPage from "./pages/Error/ErrorPage";
import HrundelDecor from "./components/UI/HrundelDecor/HrundelDecor";
import { BoardProvider, useBoards } from "./contexts/BoardContext";
import BoardsListModal from "./components/Features/BoardsListModal/BoardsListModal";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppContent() {
    const { currentBoardId, setCurrentBoardId, boards, isBoardsModalOpen, openBoardsModal, closeBoardsModal } = useBoards();
    const currentBoard = boards.find((b) => b.id === currentBoardId);

    return (
        <>
            <Navbar
                currentBoardTitle={currentBoard?.title}
                onOpenBoardsModal={openBoardsModal}
            />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/worksession" element={<WorkSession />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<ErrorPage />} />
            </Routes>
            <HrundelDecor />
            <BoardsListModal
                open={isBoardsModalOpen}
                onClose={closeBoardsModal}
                onSelectBoard={setCurrentBoardId}
                currentBoardId={currentBoardId}
            />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter basename={base}>
            <BoardProvider>
                <AppContent />
            </BoardProvider>
        </BrowserRouter>
    );
}