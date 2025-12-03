import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RegistrationForm.css';

const RegistrationForm = () => {
  // в БД
  const [formData, setFormData] = useState({
    firstName: '', // имя
    lastName: '', // фамилия
    middleName: '', // отчество
    role: '', // роль
    email: '', // почта
    password: '', // пароль
    confirmPassword: '', // повтор пароля
    groupNumber: '', // номер группы
    avatar: null, // файл аватарки
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

  // обработчик загрузки аватарки
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          avatar: 'Разрешены только JPG и PNG',
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.avatar;
        return newErrors;
      });
    }
  };

  // валидация формы
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Имя обязательно';
    if (!formData.lastName.trim()) newErrors.lastName = 'Фамилия обязательна';
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // если роль = студент, то группа обязательна
    if (formData.role === 'student' && !formData.groupNumber.trim()) {
      newErrors.groupNumber = 'Выберите номер группы';
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
    <form className="registration-form" onSubmit={handleSubmit}>
      <h2>Создать аккаунт</h2>
      <div className="divider"></div>
      {/* ФИО */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">Имя*</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Фамилия*</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="middleName">Отчество</label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Аватарка */}
      <div className="form-group">
        <label>Загрузить фотографию</label>
        <div className="form-row">
          <div className="avatar-preview">
            <img
              src={
                formData.avatar
                  ? URL.createObjectURL(formData.avatar)
                  : '/src/styles/images/avatar.png'
              }
              alt="Аватар"
              className="avatar-img"
            />
          </div>
          <div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleAvatarChange}
              className={errors.avatar ? 'error' : ''}
            />
            {errors.avatar && <span className="error-message">{errors.avatar}</span>}
          </div>

        </div>
      </div>

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

      {/* Учебная группа (если студент) */}
      {formData.role === 'student' && (
        <div className="form-group">
          <label htmlFor="groupNumber">Учебная группа*</label>
          <select
            id="groupNumber"
            name="groupNumber"
            value={formData.groupNumber}
            onChange={handleChange}
            className={errors.groupNumber ? 'error' : ''}
          >
            <option value="">-- Выберите группу --</option>
            <option value="101">Группа 101</option>
            <option value="102">Группа 102</option>
            <option value="103">Группа 103</option>
            <option value="201">Группа 201</option>
          </select>
          {errors.groupNumber && <span className="error-message">{errors.groupNumber}</span>}
        </div>
      )}

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

      {/* Подтверждение пароля */}
      <div className="form-group">
        <label htmlFor="confirmPassword">Повтор пароля*</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
      </div>
      

      {/* Кнопки */}
      <div className="form-actions">
        <button type="submit" className="btn-register">
          Зарегистрироваться
        </button>
        <div className="login-link">
          <p>Уже есть аккаунт?</p>
          <Link to="/login">Войти</Link>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;