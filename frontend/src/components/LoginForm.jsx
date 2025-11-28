import { useState } from 'react';
import styles from '../styles/LoginForm.module.css';

export default function LoginForm() {
  const [role, setRole] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div className={styles.formBox}>
      <h2 className={styles.title}>Авторизоваться</h2>

      <form className={styles.form}>
        <div className={styles.divider}></div>

        {/* Почта */}
        <div className={styles.field}>
          <label className={styles.label}>Корпоративная почта:</label>
          <input type="email" placeholder="" className={styles.input} required />
        </div>

        {/* Пароль */}
        <div className={styles.field}>
          <label className={styles.label}>Пароль:</label>
          <input type="password" placeholder="" className={styles.input} required />
        </div>

        {/* Роль */}
        <div className={styles.field}>
          <label className={styles.label}>Роль в системе:</label>
          <select
            className={styles.input}
            value={role}
            onChange={handleRoleChange}
            required
          >
            <option value="">Выберите роль</option>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
            <option value="department_head">Директор департамента</option>
          </select>
        </div>

        {/* Кнопка */}
        <button type="submit" className={styles.button}>
            Войти
        </button>

        <div className={styles.forgotPassword}>
            <a href="">Забыли пароль?</a>
        </div>

        <div className={styles.divider}></div>

        {/* Ссылка на регистрацию */}
        <div className={styles.registerLinkSection}>
            Впервые здесь?{' '}
            <a href="/register">Зарегистрироваться</a>
        </div>
      </form>
    </div>
  );
}