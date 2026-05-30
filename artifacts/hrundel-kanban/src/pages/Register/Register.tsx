import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import styles from "./Register.module.css";
import hrundel from "../../assets/hrundel.svg";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !login.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }
    if (password.length < 4) {
      setError("Пароль должен быть не менее 4 символов");
      return;
    }
    setLoading(true);
    const res = await api.register(login.trim(), password, fullName.trim());
    setLoading(false);

    if (res.status === "ok") {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } else {
      setError(res.message ?? "Ошибка регистрации");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src={hrundel} alt="Hrundel" className={styles.logoImg} />
          <span className={styles.brand}>Hrundel</span>
        </div>
        <p className={styles.subtitle}>Создайте аккаунт</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorBanner}>{error}</div>}
          {success && (
            <div className={styles.successBanner}>
              Регистрация успешна! Перенаправляем на страницу входа...
            </div>
          )}

          <Input
            label="Имя"
            type="text"
            placeholder="Введите полное имя"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
          />
          <Input
            label="Логин"
            type="text"
            placeholder="Придумайте логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Не менее 4 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" full disabled={loading || success}>
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </Button>
        </form>

        <p className={styles.footer}>
          Уже есть аккаунт?{" "}
          <Link to="/login" className={styles.footerLink}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
