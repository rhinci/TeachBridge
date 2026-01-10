import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const HeaderMain = () => {
  const [userFullName, setUserFullName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/users/me/');
        const userData = response.data;
        setUserFullName(`${userData.first_name} ${userData.last_name}`);
      } catch (error) {
        console.error('Не удалось загрузить профиль:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="header-main">
      <div className="header-main-container">
        <div className="header-logo">
          <img src="/src/styles/images/logo1.png" alt="TeachBridge Logo" />
        </div>
        <div className="header-main-container">
          <div className="header-notifications">
            <img src="/src/styles/images/notifications.png" alt="Notifications" />
          </div>

          <Link to="/profile">
            <div className="header-user-container">
              <p>
                {loading ? 'Загрузка...' : userFullName || 'Пользователь'}
              </p>
              <div>
                <img
                  src="/src/styles/images/personal-chats-inactive.png"
                  alt="User image"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderMain;