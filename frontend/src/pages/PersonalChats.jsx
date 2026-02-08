import React, { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import PersonalChatComponent from '../components/PersonalChatComponent';
import { chatService } from '../services/chatService';

const PersonalChats = () => {
  const [personalChats, setPersonalChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Функция для получения ID текущего пользователя
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user ? user.id : null;
    } catch (error) {
      console.error('Ошибка при получении ID пользователя:', error);
      return null;
    }
  };

  // Загружаем личные чаты при монтировании
  useEffect(() => {
    loadPersonalChats();
  }, []);

  const loadPersonalChats = async () => {
    try {
      setLoading(true);
      const chats = await chatService.getPersonalChats();
      console.log('Loaded personal chats:', chats);
      
      // Добавим отладку для каждого чата
      chats.forEach((chat, index) => {
        console.log(`Chat ${index} (ID: ${chat.id}):`, {
          name: chat.name,
          participants: chat.participants_info,
          display_avatar: chat.display_avatar,
          chat_type: chat.chat_type
        });
      });
      
      setPersonalChats(chats);
    } catch (err) {
      setError('Не удалось загрузить личные чаты');
      console.error('Ошибка загрузки чатов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация чатов по поисковому запросу
  const filteredChats = personalChats.filter(chat => {
    if (!searchQuery) return true;
    
    // Поиск по имени собеседника
    const currentUserId = getCurrentUserId();
    const otherParticipant = chat.participants_info?.find(p => 
      p.id !== currentUserId
    );
    
    if (!otherParticipant) return false;
    
    const fullName = `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Отладочный вывод
  useEffect(() => {
    if (personalChats.length > 0) {
      console.log('=== Final Chat Data ===');
      console.log('Total chats:', personalChats.length);
      
      const currentUserId = getCurrentUserId();
      console.log('Current user ID:', currentUserId);
      
      personalChats.forEach((chat, index) => {
        const otherParticipant = chat.participants_info?.find(p => p.id !== currentUserId);
        console.log(`Chat ${index}:`, {
          id: chat.id,
          name: chat.name,
          otherParticipant: otherParticipant ? {
            id: otherParticipant.id,
            name: otherParticipant.get_full_name,
            photo: otherParticipant.photo
          } : null,
          display_avatar: chat.display_avatar
        });
      });
    }
  }, [personalChats]);

  return (
    <MainLayout
      header={<div>Личные чаты</div>}
      search={
        <div className="search-container">
          <input 
            placeholder="Поиск пользователя" 
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
      <div className='personal-chat-container'>
        {loading ? (
          <div className="loading">Загрузка чатов...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredChats.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'По вашему запросу чатов не найдено' : 'У вас нет личных чатов'}
          </div>
        ) : (
          filteredChats.map(chat => (
            <PersonalChatComponent 
              key={chat.id} 
              chat={chat}
              onClick={() => window.location.href = `/personal-chat/${chat.id}`}
            />
          ))
        )}
      </div>
    </MainLayout>
  );
};

export default PersonalChats;