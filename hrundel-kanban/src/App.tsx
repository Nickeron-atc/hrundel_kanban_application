import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Features/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import WorkSession from "./pages/WorkSession/WorkSession";
import About from "./pages/About/About";
import ErrorPage from "./pages/Error/ErrorPage";
import HrundelDecor from "./components/UI/HrundelDecor/HrundelDecor";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <BrowserRouter basename={base}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/worksession" element={<WorkSession />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <HrundelDecor />
    </BrowserRouter>
  );
}
