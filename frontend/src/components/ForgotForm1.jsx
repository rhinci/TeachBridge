import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotForm1 = ({ onEmailSubmitted }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Введите корпоративную почту');
      return;
    }
    if (!email.endsWith('@dvfu.ru')) {
      setError('Используйте почту в домене ДВФУ (@dvfu.ru)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/users/password-reset/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        onEmailSubmitted(email); // переключаем на шаг 2
      } else {
        setError(data.detail || 'Не удалось отправить код');
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Восстановление пароля</h2>
      <div className="divider"></div>
      <div className='group-forgot'>
        <p className='forgot-text'>Введите корпоративную почту для получения кода</p>
        <input
          type="email"
          placeholder="example@dvfu.ru"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='input-code'
          required
        />
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="form-actions-forgot-password">
        <button type="submit" className="btn-register" disabled={loading}>
          {loading ? 'Отправка...' : 'Далее'}
        </button>
        <div className="login-link">
          <p>Впервые здесь?</p>
          <Link to="/registration">Зарегистрироваться</Link>
        </div>
      </div>
    </form>
  );
};

export default ForgotForm1;