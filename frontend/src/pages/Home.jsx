import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StudyChatComponent from '../components/StudyChatComponent';
import { chatService } from '../services/chatService';
import '../styles/StudyChats.css';

const Home = () => {
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Загружаем учебные чаты при монтировании
  useEffect(() => {
    loadGroupChats();
  }, []);

  const loadGroupChats = async () => {
    try {
      setLoading(true);
      const chats = await chatService.getGroupChats();
      console.log('=== LOADED GROUP CHATS FOR HOME ===');
      console.log('Response:', chats);
      
      // Проверяем структуру данных
      if (Array.isArray(chats)) {
        console.log(`Got ${chats.length} group chats`);
        setGroupChats(chats);
      } else {
        console.error('Expected array but got:', typeof chats, chats);
        setGroupChats([]);
      }
    } catch (err) {
      console.error('Error loading group chats:', err);
      setError(`Не удалось загрузить учебные чаты: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация чатов по поисковому запросу
  const filteredChats = groupChats.filter(chat => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      chat?.name?.toLowerCase().includes(searchLower) ||
      chat?.description?.toLowerCase().includes(searchLower) ||
      chat?.department?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getCurrentUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user ? user.role : null;
    } catch (error) {
      console.error('Ошибка при получении роли пользователя:', error);
      return null;
    }
  };

  const userRole = getCurrentUserRole();
  const canCreateChats = ['teacher', 'director', 'admin'].includes(userRole);

  console.log('Home (StudyChats) render:', {
    chatsCount: groupChats.length,
    filteredCount: filteredChats.length,
    userRole,
    canCreateChats
  });

  return (
    <MainLayout
      header={<div>Учебные чаты</div>}
      search={
        <div className="search-container">
          <input 
            placeholder="Поиск по названию или описанию..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
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
        {canCreateChats && (
          <div className="create-chat-button-container">
            <button 
              className="create-chat-btn"
              onClick={() => window.location.href = '/director/group-chats/create'}
            >
              + Создать учебный чат
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="loading">Загрузка чатов...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'По вашему запросу чатов не найдено' : 'У вас нет учебных чатов'}
          </div>
        ) : (
          <div className="study-chats-grid">
            {filteredChats.map(chat => {
              console.log('Rendering chat in home:', chat.id);
              return (
                <StudyChatComponent 
                  key={chat.id} 
                  chat={chat}
                  onClick={() => window.location.href = `/study-chat/${chat.id}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Home;