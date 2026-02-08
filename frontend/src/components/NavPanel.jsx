import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 

const NavPanel = () => {
  const navigate = useNavigate();

  // Получаем роль текущего пользователя
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user ? user.role : null;
    } catch (error) {
      console.error('Ошибка получения роли пользователя:', error);
      return null;
    }
  };

  const userRole = getUserRole();
  const isDirector = userRole === 'director';

  const handleLogout = () => {
    // Удаляем токены
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Перенаправляем на логин
    navigate('/login', { replace: true });
  };

  return (
    <nav className='nav-panel'>
      <div className='nav-panel-container'>
        <div className='nav-panel-container-menu'>
          <NavLink to="/" className="nav-tooltip-wrapper" aria-label="Учебные чаты">
            <div className='nav-panel-inactive'>
              <img src="/src/styles/images/study-chats-inactive.png" alt="Study chats" />
            </div>
            <span className="nav-tooltip">Учебные чаты</span>                
          </NavLink>

          <NavLink to="/personalchats" className="nav-tooltip-wrapper" aria-label="Личные чаты">
            <div className='nav-panel-inactive'>
              <img src="/src/styles/images/personal-chats-inactive.png" alt="Personal chats" />
            </div>
            <span className="nav-tooltip">Личные чаты</span>  
          </NavLink>
          
          <NavLink to="/courses" className="nav-tooltip-wrapper" aria-label="Курсы">
            <div className='nav-panel-inactive'>
              <img src="/src/styles/images/course-inactive.png" alt="Courses" />
            </div>
            <span className="nav-tooltip">Курсы</span>         
          </NavLink>

          {/* Раздел для директора */}
          {isDirector && (
            <NavLink to="/director" className="nav-tooltip-wrapper" aria-label="Управление пользователями">
              <div className='nav-panel-inactive'>
                {/* Заглушка для иконки управления */}
                <img src="/src/styles/images/management-inactive.png" alt="Management" />
              </div>
              <span className="nav-tooltip">Управление</span>         
            </NavLink>
          )}
        </div>

        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className="nav-tooltip-wrapper"
          aria-label="Выйти"
        >
          <div className='nav-panel-inactive'>
            <img src="/src/styles/images/exit.png" alt="Exit" />
          </div>
          <span className="nav-tooltip">Выйти</span>           
        </a>
      </div>
    </nav>
  );
};

export default NavPanel;