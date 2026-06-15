import { ReactNode, HTMLAttributes } from "react";
import styles from "./Badge.module.css";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "danger";
  children: ReactNode;
}

/**
 * @param variant - цветовая схема бейджа
 */
export default function Badge({
  variant = "default",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[styles.badge, styles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
