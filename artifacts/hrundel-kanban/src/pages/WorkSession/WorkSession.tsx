import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/api";
import KanbanBoard from "../../components/Features/KanbanBoard/KanbanBoard";
import styles from "./WorkSession.module.css";

export default function WorkSession() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!auth.isLoggedIn()) return null;

  return (
    <main className={styles.page}>
      <KanbanBoard />
    </main>
  );
}
