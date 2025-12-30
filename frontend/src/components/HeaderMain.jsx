import React from 'react';
import { Link } from 'react-router-dom';

const HeaderMain = () => {
  return (
    <header className="header-main">
      <div className='header-main-container'>
        <div className="header-logo">
            <img src="/src/styles/images/logo1.png" alt="TeachBridge Logo" />
        </div>
        <div className='header-main-container'>
            <div className='header-notifications'>
                <img src="/src/styles/images/notifications.png" alt="Notifications" />
            </div>

            <Link to="/profile">
              <div className='header-user-container'>
                  <p>
                      User Name
                  </p>
                  <div>
                      <img src="src/styles/images/personal-chats-inactive.png" alt="User image" />
                  </div>
              </div>            
            </Link>

        </div>
      </div>
      
    </header>
  );
};

export default HeaderMain;