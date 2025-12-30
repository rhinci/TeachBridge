import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotForm1 = () => {

return (
    <form className="form">
      <h2>Восстановление пароля</h2>
      <div className="divider"></div>
      <div className='group-forgot'>
        <p className='forgot-text'>Введите код, отправленный на корпоративную почту </p>
        <input type="code" className='input-code'/>        
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-register">
          Далее
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