import React, { useState } from 'react';
import '../styles/UserProfilePhoto.css';

const UserProfilePhoto = ({ user, onCreateChat, creatingChat }) => {
  const [photoUrl, setPhotoUrl] = useState(getPhotoUrl(user));

  function getPhotoUrl(userData) {
    if (userData?.photo) {
      // Если фото начинается с /media/, добавляем базовый URL
      if (userData.photo.startsWith('/media/')) {
        return `http://localhost:8000${userData.photo}`;
      }
      return userData.photo;
    }
    return '/src/styles/images/avatar.png';
  }

  // Получаем полное имя пользователя
  const getFullName = () => {
    if (user.get_full_name) {
      return user.get_full_name;
    }
    return `${user.last_name || ''} ${user.first_name || ''} ${user.patronymic || ''}`.trim();
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

  return (
    <div className='user-photo-card'>
      <div className='user-profile-photo'>
        <img
          src={photoUrl}
          alt={`Фотография ${getFullName()}`}
          onError={() => setPhotoUrl('/src/styles/images/avatar.png')}
        />
      </div>

      <div className='user-profile-summary'>
        <h3 className='user-profile-name'>{getFullName()}</h3>
        <div className='user-profile-role'>{getRoleDisplay()}</div>
      </div>

      <button 
        className='btn-create-chat'
        onClick={onCreateChat}
        disabled={creatingChat}
      >
        {creatingChat ? (
          <>
            <span className="spinner-small"></span>
            Создание чата...
          </>
        ) : (
          'Написать личное сообщение'
        )}
      </button>
    </div>
  );
};

export default UserProfilePhoto;