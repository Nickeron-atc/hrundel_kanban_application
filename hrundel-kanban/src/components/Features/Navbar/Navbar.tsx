import { NavLink, useNavigate } from "react-router-dom";
import { auth, api } from "../../../services/api";
import Button from "../../UI/Button/Button";
import styles from "./Navbar.module.css";
import hrundel from "../../../assets/hrundel.svg";

export default function Navbar() {
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
            <NavLink
              to="/worksession"
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ""].filter(Boolean).join(" ")
              }
            >
              Доска
            </NavLink>
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Выйти
            </Button>
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
