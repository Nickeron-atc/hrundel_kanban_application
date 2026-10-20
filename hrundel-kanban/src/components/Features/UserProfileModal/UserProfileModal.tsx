// src/components/Features/UserProfileModal/UserProfileModal.tsx
// import { useState } from "react";
// import { AppModal } from "../../UI/AppModal/AppModal";
// import Input from "../../UI/Input/Input";
// import Button from "../../UI/Button/Button";
// import UserAvatar from "../../UI/UserAvatar/UserAvatar";
// import moisey from "../../../assets/moisey.png";
// import styles from "./UserProfileModal.module.css";
// import { useBoards } from "../../../contexts/BoardContext";

import { useState, useEffect, useRef } from "react";
import { AppModal } from "../../UI/AppModal/AppModal";
import Input from "../../UI/Input/Input";
import Button from "../../UI/Button/Button";
import UserAvatar from "../../UI/UserAvatar/UserAvatar";
import styles from "./UserProfileModal.module.css";
import { useBoards } from "../../../contexts/BoardContext";
import { api, auth } from "../../../services/api";
import { useQueryClient } from "@tanstack/react-query";

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
    // const [nickname] = useState("@hrundel_user");
    // const [login] = useState("hrundel_login");
    // const [name, setName] = useState("Хрюндель Моисеевич");
    // const avatarUrl = moisey; // <-- Исправлена опечатка с ");"

    const queryClient = useQueryClient();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [login, setLogin] = useState("");
    const [name, setName] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarVersion, setAvatarVersion] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { boards, reloadUser, bumpAvatarVersion } = useBoards();

    // const [originalName] = useState("Хрюндель Моисеевич");
    // const hasChanges = name !== originalName;

    useEffect(() => {
        if (!open) return;
        const token = auth.getToken();
        if (!token) return;
        api.getMe().then((res) => {
        if (res.status === "ok") {
            const u = res.data.user;
            setLogin(u.login);
            setName(u.full_name || u.login);
            setOriginalName(u.full_name || u.login);
            setAvatarUrl(
            u.has_avatar
                ? `/api/users/${u.id}/avatar?v=${Date.now()}`
                : ""
            );
        }
        });
    }, [open]);

    const hasChanges = name !== originalName;

    const handleApply = async () => {
        const token = auth.getToken();
        if (!token) return;
        const payload = token.split(".")[1];
        const userId = JSON.parse(atob(payload)).user_id;
        setSaving(true);
        const res = await api.updateProfile(String(userId), { full_name: name });
        setSaving(false);
        if (res.status === "ok") {
        setOriginalName(name);
        }
    };

    const handleCancel = () => {
        setName(originalName);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const token = auth.getToken();
        if (!token) return;
        const payload = token.split(".")[1];
        const userId = JSON.parse(atob(payload)).user_id;
        setUploading(true);
        const res = await api.uploadAvatar(String(userId), file);
        setUploading(false);
        if (res.status === "ok") {
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            bumpAvatarVersion();
            await reloadUser();
            setAvatarUrl(`/api/users/${userId}/avatar?v=${Date.now()}`);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDeleteAvatar = async () => {
        const token = auth.getToken();
        if (!token) return;
        const payload = token.split(".")[1];
        const userId = JSON.parse(atob(payload)).user_id;
        const res = await api.deleteAvatar(String(userId));
        if (res.status === "ok") {
            setAvatarUrl("");
            await reloadUser();
            bumpAvatarVersion();
        }
    };

    const [friendBoards, setFriendBoards] = useState([
        { id: "fb1", title: "Доска друга 1", owner: "Друг 1" },
        { id: "fb2", title: "Доска друга 2", owner: "Друг 2" },
    ]);

    // const handleApply = () => {
    //     console.log("Применяем изменения:", { name });
    // };

    // const handleCancel = () => {
    //     setName(originalName);
    // };

    const handleRemoveFriendBoard = (boardId: string) => {
        setFriendBoards(friendBoards.filter((b) => b.id !== boardId));
    };

      return (
    <AppModal
      open={open}
      onOpenChange={onClose}
      title="Профиль пользователя"
      size="md"
      footer={
        hasChanges ? (
          <>
            <Button variant="ghost" onClick={handleCancel} disabled={saving}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleApply} disabled={saving}>
              {saving ? "Сохранение..." : "Применить"}
            </Button>
          </>
        ) : null
      }
    >
      <div className={styles.profileContent}>
        <div className={styles.avatarSection}>
          <div
            className={styles.avatarClickArea}
            onClick={handleAvatarClick}
            title="Загрузить аватарку"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className={`${styles.avatarImg} ${styles.xl}`}
              />
            ) : (
              <UserAvatar
                src=""
                name={name || "?"}
                size="xl"
                showName={false}
              />
            )}
            <div className={styles.avatarOverlay}>
              {uploading ? "Загрузка..." : "Изменить"}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          {avatarUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteAvatar}
              style={{ marginTop: "8px" }}
            >
              Удалить фото
            </Button>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Логин</label>
          <div className={styles.readOnlyField}>{login}</div>
        </div>

        <div className={styles.fieldGroup}>
          <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className={styles.boardsSection}>
          <h3 className={styles.sectionTitle}>Мои доски</h3>
          {boards.length === 0 ? (
            <div className={styles.emptyState}>У вас пока нет своих досок</div>
          ) : (
            <div className={styles.boardsList}>
              {boards.map((board) => (
                <div key={board.id} className={styles.boardItem}>
                  <div>
                    <div className={styles.boardTitle}>{board.title}</div>
                    <div className={styles.boardOwner}>Владелец: Вы</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}