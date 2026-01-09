import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotForm2 = ({ email }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/users/password-reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: password, new_password2: confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.detail || 'Неверный код или истёк срок действия');
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
        <p className='forgot-text'>
          Мы отправили код на <strong>{email}</strong>
        </p>
        <input
          type="text"
          placeholder="Код из письма"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className='input-code'
          required
        />
        <p className='forgot-text'>
          Обновите пароль:
        </p>
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='input-code'
          required
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className='input-code'
          required
        />
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-reset" disabled={loading}>
        {loading ? 'Обработка...' : 'Сбросить пароль'}
        </button>

      </div>
    </form>
  );
};

export default ForgotForm2;