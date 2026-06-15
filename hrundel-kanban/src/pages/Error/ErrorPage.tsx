import { useNavigate } from "react-router-dom";
import { auth } from "../../services/api";
import Button from "../../components/UI/Button/Button";
import styles from "./ErrorPage.module.css";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.desc}>
        Такой страницы не существует. Возможно, вы ввели неверный адрес.
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(auth.isLoggedIn() ? "/worksession" : "/login")}
        >
          На главную
        </Button>
      </div>
    </div>
  );
}
