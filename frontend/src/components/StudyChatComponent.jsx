import React from 'react';
import '../styles/StudyChatComponent.css';

const StudyChatComponent = ({ chat, onClick }) => {
  // Проверяем, что chat существует
  if (!chat) {
    console.error('StudyChatComponent: chat is undefined');
    return null;
  }

  // Получаем информацию для отображения с безопасным доступом
  const chatName = chat?.name || 'Без названия';
  const departmentName = chat?.department?.name || 'Не указано';
  const lastMessage = chat?.last_message?.content || 'Нет сообщений';
  const unreadCount = chat?.unread_count || 0;
  const sectionCount = chat?.section_count || 0;
  const description = chat?.description || '';
  const participantsCount = chat?.participants?.length || chat?.participants_info?.length || 0;
  
  // Получаем URL аватарки чата
  const getAvatarUrl = () => {
    if (chat?.avatar) {
      return chat.avatar;
    }
    
    if (chat?.display_avatar) {
      return chat.display_avatar;
    }
    
    // Дефолтная аватарка для учебного чата
    return '/src/styles/images/default-group-avatar.png';
  };

  // Форматируем дату последнего сообщения
  const getLastMessageTime = () => {
    if (!chat?.last_message?.created_at) return '';
    
    try {
      const messageDate = new Date(chat.last_message.created_at);
      const now = new Date();
      const diffHours = (now - messageDate) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffHours < 168) { // 7 дней
        return messageDate.toLocaleDateString([], { weekday: 'short' });
      } else {
        return messageDate.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const avatarUrl = getAvatarUrl();
  const lastMessageTime = getLastMessageTime();

  console.log('StudyChatComponent rendering:', {
    id: chat.id,
    name: chatName,
    department: departmentName,
    hasAvatar: !!chat.avatar
  });

  return (
    <div className='study-chat-component' onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className='study-chat-icon'>
        <img 
          src={avatarUrl} 
          alt={chatName}
          onError={(e) => {
            console.log('Failed to load avatar, using default');
            e.target.src = '/src/styles/images/default-group-avatar.png';
          }}
        />
      </div>
      <div className='study-chat-info'>
        <div className='study-chat-header'>
          <div className='study-chat-name'>{chatName}</div>
          {lastMessageTime && (
            <div className='study-chat-time'>{lastMessageTime}</div>
          )}
        </div>
        
        {departmentName !== 'Не указано' && (
          <div className='study-chat-department'>
            <span className='department-label'>Департамент:</span>
            <span className='department-name'>{departmentName}</span>
          </div>
        )}
        
        {description && (
          <div className='study-chat-description'>
            {description.length > 80 
              ? `${description.substring(0, 80)}...` 
              : description}
          </div>
        )}
        
        <div className='study-chat-latest-message'>
          <span className='message-label'>Последнее сообщение:</span>
          <span className='message-text'>
            {lastMessage.length > 60 
              ? `${lastMessage.substring(0, 60)}...` 
              : lastMessage}
          </span>
        </div>
        
        <div className='study-chat-stats'>
          <div className='stat-item'>
            <span className='stat-icon'>📚</span>
            <span className='stat-text'>Разделы: {sectionCount}</span>
          </div>
          <div className='stat-item'>
            <span className='stat-icon'>👥</span>
            <span className='stat-text'>Участники: {participantsCount}</span>
          </div>
        </div>
      </div>
      
      {unreadCount > 0 && (
        <div className='study-chat-notifications'>
          <div className='study-message-count' title={`${unreadCount} непрочитанных`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyChatComponent;