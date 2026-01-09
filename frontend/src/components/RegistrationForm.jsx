import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RegistrationForm.css';

const RegistrationForm = () => {
  const navigate = useNavigate();
  // в БД
  const [formData, setFormData] = useState({
    firstName: '', // имя
    lastName: '', // фамилия
    middleName: '', // отчество
    role: '', // роль
    email: '', // почта
    password: '', // пароль
    confirmPassword: '', // повтор пароля
    study_group: '', // номер группы
    avatar: null, // файл аватарки
  });

  const [studyGroups, setStudyGroups] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudyGroups = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/users/study-groups/');
        if (response.ok) {
          const data = await response.json();
          setStudyGroups(data);
        }
      } catch (err) {
        console.error('Не удалось загрузить учебные группы', err);
      }
    };
    fetchStudyGroups();
  }, []);

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    } else if (!formData.email.trim().endsWith('@dvfu.ru')) {
      newErrors.email = 'Используйте почту @dvfu.ru';
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
    if (formData.role === 'student' && !formData.study_group) {
      newErrors.study_group = 'Выберите учебную группу';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('first_name', formData.firstName.trim());
    fd.append('last_name', formData.lastName.trim());
    if (formData.middleName.trim()) {
      fd.append('patronymic', formData.middleName.trim());
    }
    fd.append('role', formData.role);
    fd.append('email', formData.email.trim());
    fd.append('password', formData.password);
    fd.append('password2', formData.confirmPassword);

    if (formData.role === 'student' && formData.study_group) {
      fd.append('study_group', formData.study_group);
    }

    if (formData.avatar) {
      fd.append('photo', formData.avatar);
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/auth/users/register/', {
        method: 'POST',
        body: fd,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Регистрация успешна! Ожидайте подтверждения администратором.');
        navigate('/login');
      } else {
        // Преобразуем ошибки DRF в удобный вид
        const fieldMap = {
          first_name: 'firstName',
          last_name: 'lastName',
          patronymic: 'middleName',
          study_group: 'study_group',
          password: 'password',
          email: 'email',
          role: 'role',
        };

        const newErrors = {};
        for (const [field, messages] of Object.entries(data)) {
          const uiField = fieldMap[field] || field;
          newErrors[uiField] = messages[0];
        }

        setErrors(newErrors);
        alert('Ошибка регистрации. Проверьте форму.');
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
          <label htmlFor="study_group">Учебная группа*</label>
          <select
            id="study_group"
            name="study_group"
            value={formData.study_group}
            onChange={handleChange}
            className={errors.study_group ? 'error' : ''}
          >
            <option value="">-- Выберите группу --</option>
            {studyGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.code} ({group.department.name})
              </option>
            ))}
          </select>
          {errors.study_group && <span className="error-message">{errors.study_group}</span>}
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