import React from 'react';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';

const NavPanel = () => {
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

            </div>

            <Link to="/login" className="nav-tooltip-wrapper" aria-label="Выйти">
                <div className='nav-panel-inactive'>
                    <img src="/src/styles/images/exit.png" alt="Exit" />
                </div>
                <span className="nav-tooltip">Выйти</span>           
            </Link>

        </div>
    </nav>
  );
};

export default NavPanel;