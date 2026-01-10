import React, { useState, useEffect } from 'react';
import '../styles/ProfileInfo.css';
import { getCurrentUser } from '../services/profileService';

const ProfileInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="info-container">Загрузка...</div>;
  }

  if (!user) {
    return <div className="info-container">Не удалось загрузить данные профиля.</div>;
  }

  return (
    <div className='info-container'>
      <div className='info-section'>
        <div className='info-section-type'>ФИО</div>
        <div className='info-section-content'>{user.full_name || `${user.last_name} ${user.first_name} ${user.patronymic || ''}`.trim()}</div>
      </div>
      <div className='info-section'>
        <div className='info-section-type'>Роль</div>
        <div className='info-section-content'>{user.role_display || user.role}</div>
      </div>
      <div className='info-section'>
        <div className='info-section-type'>Учебная группа</div>
        <div className='info-section-content'>
          {user.study_group_name || (user.role === 'student' ? 'Не указана' : '—')}
        </div>
      </div>
      <div className='info-section'>
        <div className='info-section-type'>Корпоративная почта</div>
        <div className='info-section-content'>{user.email}</div>
      </div>
    </div>
  );
};

export default ProfileInfo;