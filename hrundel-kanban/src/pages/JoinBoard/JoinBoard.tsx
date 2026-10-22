import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, auth } from "../../services/api";
import styles from "./JoinBoard.module.css";

export default function JoinBoard() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Невалидная ссылка");
            return;
        }

        if (!auth.isLoggedIn()) {
            localStorage.setItem("pending_join_token", token);
            navigate("/login");
            return;
        }

        api.joinBoard(token).then((res) => {
            if (res.status === "ok") {
                navigate("/worksession");
            } else {
                setError(res.message || "Не удалось присоединиться");
            }
        }).catch(() => {
            setError("Ошибка соединения");
        });
    }, [token, navigate]);

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {error ? (
                    <>
                        <h2 className={styles.title}>Ошибка</h2>
                        <p className={styles.error}>{error}</p>
                        <button className={styles.btn} onClick={() => navigate("/worksession")}>
                            На главную
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.spinner} />
                        <p className={styles.text}>Присоединяемся к доске...</p>
                    </>
                )}
            </div>
        </div>
    );
}
