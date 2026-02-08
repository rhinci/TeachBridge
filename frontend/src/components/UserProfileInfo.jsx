import React from 'react';
import '../styles/UserProfileInfo.css';

const UserProfileInfo = ({ user }) => {
  // Получаем полное имя пользователя
  const getFullName = () => {
    if (user.get_full_name) {
      return user.get_full_name;
    }
    
    const lastName = user.last_name || '';
    const firstName = user.first_name || '';
    const patronymic = user.patronymic || '';
    
    return `${lastName} ${firstName} ${patronymic}`.trim();
  };

  // Получаем роль на русском
  const getRoleDisplay = () => {
    const roles = {
      'student': 'Студент',
      'teacher': 'Преподаватель',
      'director': 'Директор',
      'admin': 'Администратор'
    };
    
    return roles[user.role] || user.role;
  };

  // Получаем название группы (только для студентов)
  const getGroupDisplay = () => {
    if (user.role !== 'student') {
      return '—';
    }
    
    if (user.study_group_name) {
      return user.study_group_name;
    }
    
    if (user.study_group?.code) {
      return user.study_group.code;
    }
    
    return 'Не указана';
  };

  // Получаем департамент
  const getDepartmentDisplay = () => {
    if (user.department?.name) {
      return user.department.name;
    }
    
    if (user.department_name) {
      return user.department_name;
    }
    
    return 'Не указан';
  };

  // Форматируем email
  const getEmailDisplay = () => {
    if (user.email) {
      return user.email;
    }
    
    return 'Не указан';
  };

  // Проверяем, подтвержден ли аккаунт
  const getStatusDisplay = () => {
    if (user.is_approved === true) {
      return '✅ Подтверждён';
    } else if (user.is_approved === false) {
      return '⏳ Ожидает подтверждения';
    }
    return '❓ Статус неизвестен';
  };

  return (
    <div className='user-info-container'>
      <div className='user-info-section'>
        <div className='user-info-section-type'>ФИО</div>
        <div className='user-info-section-content'>{getFullName()}</div>
      </div>
      
      <div className='user-info-section'>
        <div className='user-info-section-type'>Роль</div>
        <div className='user-info-section-content'>{getRoleDisplay()}</div>
      </div>
      
      {user.role === 'student' && (
        <div className='user-info-section'>
          <div className='user-info-section-type'>Учебная группа</div>
          <div className='user-info-section-content'>{getGroupDisplay()}</div>
        </div>
      )}
      
      <div className='user-info-section'>
        <div className='user-info-section-type'>Департамент</div>
        <div className='user-info-section-content'>{getDepartmentDisplay()}</div>
      </div>
      
      <div className='user-info-section'>
        <div className='user-info-section-type'>Email</div>
        <div className='user-info-section-content'>{getEmailDisplay()}</div>
      </div>
      
      <div className='user-info-section'>
        <div className='user-info-section-type'>Статус аккаунта</div>
        <div className='user-info-section-content'>{getStatusDisplay()}</div>
      </div>
      
      {user.created_at && (
        <div className='user-info-section'>
          <div className='user-info-section-type'>В системе с</div>
          <div className='user-info-section-content'>
            {new Date(user.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileInfo;