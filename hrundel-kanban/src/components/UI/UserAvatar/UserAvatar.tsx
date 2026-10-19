// src/components/UI/UserAvatar/UserAvatar.tsx
import { useState } from "react";
import styles from "./UserAvatar.module.css";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

interface UserAvatarProps {
    src: string;
    alt?: string;
    name: string;
    size?: "sm" | "md" | "lg" | "xl"; // <-- Добавлено "xl"
    showName?: boolean;
    className?: string;
}

export function useCurrentUser() {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const res = await api.getMe();
            if (res.status === "ok") return res.data.user;
            throw new Error(res.message || "Failed to fetch user");
        },
        staleTime: 1000 * 60 * 5,
    });
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