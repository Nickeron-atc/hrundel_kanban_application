// src/components/UI/UserAvatar/UserAvatar.tsx
import { useState } from "react";
import styles from "./UserAvatar.module.css";

interface UserAvatarProps {
    src: string;
    alt?: string;
    name: string;
    size?: "sm" | "md" | "lg" | "xl"; // <-- Добавлено "xl"
    showName?: boolean;
    className?: string;
}

export default function UserAvatar({
                                       src,
                                       alt = "User",
                                       name,
                                       size = "md",
                                       showName = true,
                                       className = "",
                                   }: UserAvatarProps) {
    const [imgError, setImgError] = useState(false);
    const initial = name.trim().charAt(0).toUpperCase() || "?";

    return (
        <div className={`${styles.container} ${styles[size]} ${className}`}>
            {imgError ? (
                <div className={`${styles.fallback} ${styles[size]}`}>
                    {initial}
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className={styles.avatar}
                    onError={() => setImgError(true)}
                />
            )}
            {showName && <span className={styles.name}>{name}</span>}
        </div>
    );
}