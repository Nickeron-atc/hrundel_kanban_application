// src/components/Features/Navbar/Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { auth, api } from "../../../services/api";
import Button from "../../UI/Button/Button";
import styles from "./Navbar.module.css";
import hrundel from "../../../assets/hrundel.svg";
import moisey from "../../../assets/moisey.png";

interface NavbarProps {
  currentBoardTitle?: string;
  onOpenBoardsModal?: () => void;
}

export default function Navbar({ currentBoardTitle, onOpenBoardsModal }: NavbarProps) {
  const navigate = useNavigate();
  const loggedIn = auth.isLoggedIn();

  const handleLogout = async () => {
    await api.logout();
    auth.clearToken();
    navigate("/login");
  };

  return (
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          <NavLink to={loggedIn ? "/worksession" : "/login"} className={styles.logo}>
            <img src={hrundel} alt="Hrundel" className={styles.logoIcon} />
            Hrundel
          </NavLink>
          <div className={styles.links}>
            {loggedIn && (
                <>
                  {currentBoardTitle && (
                      <span className={styles.currentBoard}>{currentBoardTitle}</span>
                  )}
                  <button
                      onClick={onOpenBoardsModal}
                      className={styles.boardsButton}
                  >
                    Доски
                  </button>
                </>
            )}
            <NavLink
                to="/about"
                className={({ isActive }) =>
                    [styles.link, isActive ? styles.active : ""].filter(Boolean).join(" ")
                }
            >
              О проекте
            </NavLink>
          </div>
          <div className={styles.actions}>
            {loggedIn ? (
                <NavLink to={loggedIn ? "/worksession" : "/login"} className={styles.logo}>
                  <div className="row-container">
                    <div className="row-item">
                      <img src={moisey} alt="Moisey" className={styles.logoIcon} />
                    </div>
                    <div className="row-item">username</div>
                  </div>
                </NavLink>
            ) : (
                <div></div>
            )}
            {loggedIn ? (
                <div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Выйти
                  </Button>
                </div>
            ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                    Войти
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
                    Регистрация
                  </Button>
                </>
            )}
          </div>
        </div>
      </nav>
  );
}