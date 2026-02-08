import React from 'react';
import { authService } from '../utils/auth';
import '../styles/PersonalChatComponent.css';

const PersonalChatComponent = ({ chat, onClick }) => {
  // Получаем текущего пользователя
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser ? currentUser.id : null;
  
  // Функция для получения имени собеседника
  const getDisplayName = () => {
    if (!chat.participants_info || chat.participants_info.length === 0) {
      return chat.name || 'Неизвестный пользователь';
    }
    
    // Если есть текущий пользователь, находим собеседника
    if (currentUserId && chat.participants_info.length === 2) {
      const otherParticipant = chat.participants_info.find(p => p.id !== currentUserId);
      if (otherParticipant) {
        return otherParticipant.get_full_name || 
               `${otherParticipant.first_name} ${otherParticipant.last_name}`;
      }
    }
    
    // Если не нашли, используем название чата
    return chat.name || 'Неизвестный пользователь';
  };

  console.log('Current user:', currentUser);
  console.log('Chat participants:', chat.participants_info);

  // Функция для получения роли собеседника
  const getRoleDisplay = () => {
    if (!chat.participants_info || chat.participants_info.length === 0) {
      return '';
    }
    
    const currentUserId = authService.getCurrentUserId();
    const otherParticipant = chat.participants_info.find(p => p.id !== currentUserId);
    
    if (!otherParticipant) return '';
    
    const roles = {
      'student': 'Студент',
      'teacher': 'Преподаватель',
      'director': 'Директор',
      'admin': 'Администратор'
    };
    
    return roles[otherParticipant.role] || otherParticipant.role;
  };

  const displayName = getDisplayName();
  const roleDisplay = getRoleDisplay();
  const lastMessage = chat.last_message?.content || 'Нет сообщений';
  const unreadCount = chat.unread_count || 0;
  
  // Получаем URL аватарки
  const getAvatarUrl = () => {
    // Если есть display_avatar от бекенда
    if (chat.display_avatar) return chat.display_avatar;
    
    // Ищем аватарку собеседника
    if (chat.participants_info && chat.participants_info.length > 0) {
      const currentUserId = authService.getCurrentUserId();
      const otherParticipant = chat.participants_info.find(p => p.id !== currentUserId);
      if (otherParticipant && otherParticipant.photo) {
        return otherParticipant.photo;
      }
    }
    
    // Дефолтная аватарка
    return '/src/styles/images/default-avatar.png';
  };

  // DEBUG: выводим информацию о чате
  console.log('Chat data:', {
    chatId: chat.id,
    chatName: chat.name,
    participants: chat.participants_info,
    currentUserId,
    displayName
  });

  return (
    <div className='personal-chat-component' onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className='personal-chat-icon'>
        <img 
          src={getAvatarUrl()} 
          alt={displayName}
          onError={(e) => {
            e.target.src = '/src/styles/images/default-avatar.png';
          }}
        />
      </div>
      <div className='personal-chat-info'>
        <div className='personal-chat-name-role'>
          <div className='personal-chat-name'>{displayName}</div>
          {roleDisplay && (
            <>
              <div className='dot'> • </div>
              <div className='personal-chat-role'>{roleDisplay}</div>
            </>
          )}
        </div>

        <div className='personal-chat-latest-message'>
          {lastMessage.length > 100 ? `${lastMessage.substring(0, 100)}...` : lastMessage}
        </div>
      </div>
      
      {unreadCount > 0 && (
        <div className='personal-chat-messages'>
          <div className='personal-message-count'>{unreadCount}</div>
        </div>
      )}
    </div>
  );
};

export default PersonalChatComponent;