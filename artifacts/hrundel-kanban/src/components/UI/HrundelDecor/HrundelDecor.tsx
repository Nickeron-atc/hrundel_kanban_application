import styles from "./HrundelDecor.module.css";
import hrundel from "../../../assets/hrundel.svg";

export default function HrundelDecor() {
  return (
    <img
      src={hrundel}
      alt=""
      aria-hidden="true"
      className={styles.decor}
    />
  );
}
