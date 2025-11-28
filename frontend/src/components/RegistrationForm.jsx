import { useState } from 'react';
import styles from '../styles/RegistrationForm.module.css';

export default function RegistrationForm() {
  const [role, setRole] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div className={styles.formBox}>
      <h2 className={styles.title}>Создать аккаунт</h2>

      <form className={styles.form}>
        <div className={styles.divider}></div>
        
        {/* Имя, Фамилия, Отчество */}
        <div className={styles.row}>
          <div>
            <label className={styles.label}>Имя:</label>
            <input type="text" placeholder="" className={styles.input} required />
          </div>
          <div>
            <label className={styles.label}>Фамилия:</label>
            <input type="text" placeholder="" className={styles.input} required />
          </div>
          <div>
            <label className={styles.label}>Отчество:</label>
            <input type="text" placeholder="" className={styles.input} />
          </div>
        </div>

        {/* Фотография */}
        <div className={styles.avatarSection}>
          <div className={styles.avatar}><img src="avatar.png" alt="Avatar" className={styles.avatar}/></div>
          <span className={styles.avatarLabel}>Загрузить фотографию</span>
        </div>

        {/* Роль */}
        <div>
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

        {/* Номер группы (только для студентов) */}
        {role === 'student' && (
          <div>
            <label className={styles.label}>Номер группы:</label>
            <input type="text" placeholder="Например: Б9124-01.03.02сп" className={styles.input} />
          </div>
        )}

        {/* Почта */}
        <div>
          <label className={styles.label}>Корпоративная почта:</label>
          <input type="email" placeholder="" className={styles.input} required />
        </div>

        {/* Пароль */}
        <div>
          <label className={styles.label}>Пароль:</label>
          <input type="password" placeholder="" className={styles.input} required />
        </div>

        {/* Повтор пароля */}
        <div>
          <label className={styles.label}>Повторите пароль:</label>
          <input type="password" placeholder="" className={styles.input} required />
        </div>

        {/* Кнопка */}
        <button type="submit" className={styles.submitButton}>
          Зарегистрироваться
        </button>

        {/* Разделитель и ссылка на вход */}
        <div className={styles.authLinkSection}>
        <div className={styles.divider}></div>
        <p className={styles.authText}>
            Уже есть аккаунт?{' '}
            <a href="/login" className={styles.loginLink}>
            Войти
            </a>
        </p>
        </div>

      </form>
    </div>
  );
}