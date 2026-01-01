import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StudyChatComponent from '../components/StudyChatComponent';

const Home = () => {
  return (
    <MainLayout
      header={<div>Учебные чаты</div>}
      search={
        <div>
            <input placeholder="Поиск чата" />
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        </div>
      }
    >
      <div className='study-chats-container'>
        <StudyChatComponent/>
        <StudyChatComponent/>
      </div>
    </MainLayout>
  );
};

export default Home;