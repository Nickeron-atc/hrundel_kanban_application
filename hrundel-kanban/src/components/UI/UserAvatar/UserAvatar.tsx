// src/components/UI/UserAvatar/UserAvatar.tsx
import styles from "./UserAvatar.module.css";

interface UserAvatarProps {
    src: string;
    alt?: string;
    name: string;
    size?: "sm" | "md" | "lg";
    showName?: boolean;
}

export default function UserAvatar({
                                       src,
                                       alt = "User",
                                       name,
                                       size = "md",
                                       showName = true,
                                   }: UserAvatarProps) {
    return (
        <div className={`${styles.container} ${styles[size]}`}>
            <img src={src} alt={alt} className={styles.avatar} />
            {showName && <span className={styles.name}>{name}</span>}
        </div>
    );
}