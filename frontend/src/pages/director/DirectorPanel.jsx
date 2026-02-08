import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import PendingRegistrations from './PendingRegistrations';
import DepartmentChats from './DepartmentChats';
import '../../styles/DirectorPanel.css';

const DirectorPanel = () => {
  const [activeTab, setActiveTab] = useState('registrations');

  // Проверяем, является ли пользователь директором
  const checkIsDirector = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      const user = JSON.parse(userStr);
      return user?.role === 'director';
    } catch (error) {
      console.error('Ошибка проверки роли:', error);
      return false;
    }
  };

  const isDirector = checkIsDirector();

  // Если пользователь не директор, показываем ошибку
  if (!isDirector) {
    return (
      <MainLayout header={<div>Доступ запрещен</div>}>
        <div className="director-access-denied">
          <h2>⛔ Доступ запрещен</h2>
          <p>Эта страница доступна только директорам департаментов.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      header={<div>Управление пользователями</div>}
    >
      <div className="director-panel-wrapper">
        {/* Переключение вкладок */}
        <div className="director-tabs">
          <button
            className={`director-tab ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            📋 Заявки на регистрацию
          </button>
          <button
            className={`director-tab ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            💬 Учебные чаты департамента
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="director-content">
          {activeTab === 'registrations' ? (
            <PendingRegistrations />
          ) : (
            <DepartmentChats />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DirectorPanel;