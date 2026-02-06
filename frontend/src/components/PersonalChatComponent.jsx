import React from 'react';
import '../styles/PersonalChatComponent.css';

const PersonalChatComponent = ({ chat, onClick }) => {
  // Находим собеседника (исключаем текущего пользователя)
  const getOtherParticipant = () => {
    if (!chat.participants_info || chat.participants_info.length === 0) {
      return null;
    }
    
    const currentUserId = parseInt(localStorage.getItem('user_id'));
    const otherParticipant = chat.participants_info.find(p => p.id !== currentUserId);
    
    return otherParticipant;
  };

  const otherParticipant = getOtherParticipant();
  
  // Если нет собеседника, не показываем компонент
  if (!otherParticipant) {
    return null;
  }

  // Получаем последнее сообщение
  const lastMessage = chat.last_message?.content || 'Нет сообщений';
  const unreadCount = chat.unread_count || 0;
  
  // Получаем URL аватарки (либо аватарка собеседника, либо дефолтная)
  const avatarUrl = chat.display_avatar || otherParticipant.photo || '/src/styles/images/default-avatar.png';

  return (
    <div className='personal-chat-component' onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className='personal-chat-icon'>
        <img 
          src={avatarUrl} 
          alt={otherParticipant.get_full_name} 
          onError={(e) => {
            e.target.src = '/src/styles/images/default-avatar.png';
          }}
        />
      </div>
      <div className='personal-chat-info'>
        <div className='personal-chat-name-role'>
          <div className='personal-chat-name'>{otherParticipant.get_full_name}</div>
          <div className='dot'> • </div>
          <div className='personal-chat-role'>
            {otherParticipant.role === 'student' ? 'Студент' :
             otherParticipant.role === 'teacher' ? 'Преподаватель' :
             otherParticipant.role === 'director' ? 'Директор' : 'Администратор'}
          </div>                
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