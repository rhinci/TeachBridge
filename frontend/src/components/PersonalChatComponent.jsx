import React from 'react';
import '../styles/PersonalChatComponent.css';

const PersonalChatComponent = ({ chat, onClick }) => {
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

  const currentUserId = getCurrentUserId();
  
  // Функция для получения собеседника
  const getOtherParticipant = () => {
    if (!chat.participants_info || chat.participants_info.length === 0) {
      return null;
    }
    
    console.log('Finding other participant for user ID:', currentUserId);
    console.log('Participants:', chat.participants_info);
    
    // Если есть текущий пользователь, находим собеседника
    if (currentUserId) {
      const otherParticipant = chat.participants_info.find(p => p.id !== currentUserId);
      console.log('Found other participant:', otherParticipant);
      return otherParticipant;
    }
    
    // Если нет текущего пользователя, берем первого участника
    console.log('No current user ID, using first participant');
    return chat.participants_info[0];
  };

  const otherParticipant = getOtherParticipant();
  
  // Функция для получения имени собеседника
  const getDisplayName = () => {
    if (otherParticipant) {
      return otherParticipant.get_full_name || 
             `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
             'Неизвестный пользователь';
    }
    
    // Если нет собеседника, используем название чата
    return chat.name || 'Неизвестный пользователь';
  };

  // Функция для получения роли собеседника
  const getRoleDisplay = () => {
    if (!otherParticipant || !otherParticipant.role) return '';
    
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
    // Если есть display_avatar от бекенда (должен показывать аватарку собеседника для личных чатов)
    if (chat.display_avatar) {
      console.log('Using chat.display_avatar:', chat.display_avatar);
      return chat.display_avatar;
    }
    
    // Используем аватарку собеседника
    if (otherParticipant && otherParticipant.photo) {
      console.log('Using other participant photo:', otherParticipant.photo);
      return otherParticipant.photo;
    }
    
    // Дефолтная аватарка
    console.log('Using default avatar');
    return '/src/styles/images/default-avatar.png';
  };

  console.log('=== Chat Component Debug ===');
  console.log('Chat ID:', chat.id);
  console.log('Current user ID:', currentUserId);
  console.log('Other participant:', otherParticipant);
  console.log('Display name:', displayName);
  console.log('Avatar URL:', getAvatarUrl());
  console.log('===========================');

  return (
    <div className='personal-chat-component' onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className='personal-chat-icon'>
        <img 
          src={getAvatarUrl()} 
          alt={displayName}
          onError={(e) => {
            console.log('Image load error, using default');
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