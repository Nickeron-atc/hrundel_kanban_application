import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  full?: boolean;
}

/**
 * @param variant - визуальный стиль кнопки
 * @param size    - размер кнопки
 * @param full    - растянуть на всю ширину
 */
export default function Button({
  variant = "primary",
  size = "md",
  full = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    size !== "md" ? styles[size] : "",
    full ? styles.full : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
