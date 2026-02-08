import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import UserProfilePhoto from '../components/UserProfilePhoto';
import UserProfileInfo from '../components/UserProfileInfo';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);

  // Загружаем данные пользователя
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем данные пользователя
      const userData = await userService.getUserById(userId);
      setUser(userData);
      
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err);
      setError('Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  // Функция для создания личного чата
  const handleCreateChat = async () => {
    try {
      setCreatingChat(true);
      
      // Создаем личный чат через API
      const chat = await chatService.createPersonalChat(userId);
      
      // Переходим в созданный чат
      navigate(`/personal-chat/${chat.id}`);
      
    } catch (err) {
      console.error('Ошибка создания чата:', err);
      
      if (err.response?.status === 400 && err.response?.data?.error?.includes('уже существует')) {
        // Если чат уже существует, ищем его
        const existingChat = await findExistingChat();
        if (existingChat) {
          navigate(`/personal-chat/${existingChat.id}`);
          return;
        }
      }
      
      alert('Не удалось создать чат. Попробуйте позже.');
    } finally {
      setCreatingChat(false);
    }
  };

  // Функция для поиска существующего чата
  const findExistingChat = async () => {
    try {
      const personalChats = await chatService.getPersonalChats();
      const currentUserId = parseInt(localStorage.getItem('user_id'));
      
      return personalChats.find(chat => {
        // Проверяем, что это личный чат
        if (chat.chat_type !== 'personal') return false;
        
        // Проверяем, что в чате есть оба пользователя
        const participantIds = chat.participants_info?.map(p => p.id) || [];
        return participantIds.includes(currentUserId) && participantIds.includes(parseInt(userId));
      });
    } catch (err) {
      console.error('Ошибка поиска чата:', err);
      return null;
    }
  };

  // Получаем текущего пользователя для сравнения
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser && currentUser.id === parseInt(userId);

  if (loading) {
    return (
      <MainLayout header={<div>Профиль пользователя</div>}>
        <div className="user-profile-loading">Загрузка профиля...</div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout header={<div>Ошибка</div>}>
        <div className="user-profile-error">
          {error || 'Пользователь не найден'}
        </div>
      </MainLayout>
    );
  }

  // Если это собственный профиль, редиректим на обычный профиль
  if (isOwnProfile) {
    navigate('/profile');
    return null;
  }

  return (
    <MainLayout
      header={<div>Профиль пользователя</div>}
    >
      <div className='user-profile-wrapper'>
        <div className='user-profile-container'>
          <UserProfilePhoto 
            user={user} 
            onCreateChat={handleCreateChat}
            creatingChat={creatingChat}
          />
          <UserProfileInfo user={user} />
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;