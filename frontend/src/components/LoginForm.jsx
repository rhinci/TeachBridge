import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { authService } from '../utils/auth';

const LoginForm = () => {
  const navigate = useNavigate(); // для перехода после входа

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Корпоративная почта обязательна';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    } else if (!formData.email.trim().endsWith('@dvfu.ru')) {
      newErrors.email = 'Используйте почту @dvfu.ru';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/auth/users/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        authService.saveUserData(data);
        navigate('/');
      } else {
        setErrors({});

        if (data.error) {
          if (data.error.includes('Неверные учетные данные')) {
            setErrors({ password: 'Неверный email или пароль' });
          } else if (data.error.includes('еще не подтвержден')) {
            setErrors({ email: 'Аккаунт ещё не подтверждён администратором' });
          } else if (data.error.includes('отключен')) {
            setErrors({ email: 'Аккаунт отключён' });
          } else {
            setErrors({ email: data.error });
          }
        } else {
          setErrors({ password: 'Ошибка входа. Проверьте email и пароль.' });
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Авторизоваться</h2>
      <div className="divider"></div>

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
      <div className="form-actions-login ">
        <div className="forgot-link">
          <Link to="/forgotpassword">Забыли пароль?</Link>
        </div>
        <button type="submit" className="btn-register" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
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