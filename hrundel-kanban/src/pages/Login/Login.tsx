import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, auth } from "../../services/api";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import styles from "./Login.module.css";
import hrundel from "../../assets/hrundel.svg";

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!login.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    const res = await api.login(login.trim(), password);
    setLoading(false);

    if (res.status === "ok") {
      auth.setToken(res.data.auth_token);
      navigate("/worksession");
    } else {
      setError(res.message ?? "Ошибка авторизации");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoRow}>
          <img src={hrundel} alt="Hrundel" className={styles.logoImg} />
          <span className={styles.brand}>Hrundel</span>
        </div>
        <p className={styles.subtitle}>Войдите, чтобы открыть доску</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <Input
            label="Логин"
            type="text"
            placeholder="Введите логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            autoFocus
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" full disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <p className={styles.footer}>
          Нет аккаунта?{" "}
          <Link to="/register" className={styles.footerLink}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
