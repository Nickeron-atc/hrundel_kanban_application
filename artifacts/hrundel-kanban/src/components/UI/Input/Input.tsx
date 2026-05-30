import { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * @param label - подпись над полем
 * @param error - текст ошибки
 */
export default function Input({
  label,
  error,
  className = "",
  id,
  ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={[styles.wrapper, error ? styles.error : "", className].filter(Boolean).join(" ")}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input className={styles.input} id={inputId} {...rest} />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
