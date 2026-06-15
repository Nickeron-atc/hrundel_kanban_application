import styles from "./About.module.css";
import hrundel from "../../assets/hrundel.svg";

const STACK = [
  "React 18 + Vite",
  "React Router DOM v6",
  "CSS Modules — изоляция стилей",
  "HTML5 Drag & Drop — нативный",
  "Fetch API — без библиотек",
  "Встроенные моки API",
];

const FEATURES = [
  "Kanban-доска с тремя колонками",
  "Перетаскивание карточек между колонками",
  "Добавление задач через модальное окно",
  "Авторизация и регистрация с валидацией",
  "Сохранение токена в localStorage",
  "Минималистичный дизайн с оранжевым акцентом",
];

export default function About() {
  return (
    <div className={styles.page}>
      <article className={styles.card}>
        <div className={styles.logoRow}>
          <img src={hrundel} alt="Hrundel" className={styles.logoImg} />
          <span className={styles.brand}>Hrundel Kanban</span>
        </div>

        <p className={styles.tagline}>
          Минималистичный Kanban-инструмент для управления задачами.
          Чистый React без лишних зависимостей — только то, что нужно.
        </p>

        <div className={styles.divider} />

        <p className={styles.sectionTitle}>Возможности</p>
        <ul className={styles.list}>
          {FEATURES.map((item) => (
            <li key={item} className={styles.listItem}>
              <span className={styles.dot} />
              {item}
            </li>
          ))}
        </ul>

        <div className={styles.divider} />

        <p className={styles.sectionTitle}>Стек</p>
        <ul className={styles.list}>
          {STACK.map((item) => (
            <li key={item} className={styles.listItem}>
              <span className={styles.dot} />
              {item}
            </li>
          ))}
        </ul>

        <div className={styles.divider} />

        <p className={styles.footer}>
          Hrundel — это кабанчик. Упрямый, быстрый и надёжный — как этот инструмент.
        </p>
      </article>
    </div>
  );
}
