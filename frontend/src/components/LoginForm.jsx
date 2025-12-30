import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  // в БД
  const [formData, setFormData] = useState({
    role: '', // роль
    email: '', // почта
    password: '', // пароль
  });

  // копим ошибки
  const [errors, setErrors] = useState({});

  // обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // очистить ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // валидация формы
  const validate = () => {
    const newErrors = {};

    if (!formData.role) newErrors.role = 'Выберите роль';
    if (!formData.email.trim()) {
      newErrors.email = 'Корпоративная почта обязательна';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Данные для отправки на бэкенд:', formData);
      // Здесь можно вызвать функцию отправки на бэкенд
      // Например: sendRegistrationData(formData);
    }
  };

return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Авторизоваться</h2>
      <div className="divider"></div>

      {/* Роль */}
      <div className="form-group">
        <label htmlFor="role">Роль в системе*</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={errors.role ? 'error' : ''}
        >
          <option value="">-- Выберите роль --</option>
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
          <option value="director">Директор департамента</option>
        </select>
        {errors.role && <span className="error-message">{errors.role}</span>}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Корпоративная почта*</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      {/* Пароль */}
      <div className="form-group">
        <label htmlFor="password">Пароль*</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>
      
      {/* Кнопки */}
      <div className="form-actions">
        <div className="forgot-link">
          <Link to="/forgotpassword">Забыли пароль?</Link>
        </div>
        <button type="submit" className="btn-register">
          Войти
        </button>
        <div className="login-link">
          <p>Впервые здесь?</p>
          <Link to="/registration">Зарегистрироваться</Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;