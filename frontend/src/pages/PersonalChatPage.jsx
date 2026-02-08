import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { chatService } from '../services/chatService';
import '../styles/PersonalChatPage.css';

const PersonalChatPage = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [headerParticipant, setHeaderParticipant] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Получаем ID текущего пользователя
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

  // Загружаем информацию о чате и собеседнике
  useEffect(() => {
    loadChatData();
  }, [chatId]);

  // Polling для сообщений (каждые 5 секунд)
  useEffect(() => {
    if (chatId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  // Скролл к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    try {
      setLoading(true);
      const chatData = await chatService.getChatById(chatId);
      setChat(chatData);
      
      // Находим собеседника
      const currentUserId = getCurrentUserId();
      console.log('Current user ID:', currentUserId);
      console.log('Chat participants:', chatData.participants_info);
      
      let other = null;
      let headerParticipantData = null;
      
      if (chatData.participants_info && chatData.participants_info.length > 0) {
        if (currentUserId) {
          // Ищем участника, который не текущий пользователь
          other = chatData.participants_info.find(p => p.id !== currentUserId);
        }
        
        // Если не нашли или нет currentUserId, берем первого участника
        if (!other && chatData.participants_info.length > 0) {
          other = chatData.participants_info[0];
        }
        
        // Для заголовка используем того же участника
        headerParticipantData = other || chatData.participants_info[0];
      }
      
      setOtherParticipant(other);
      setHeaderParticipant(headerParticipantData);
      
    } catch (err) {
      setError('Не удалось загрузить информацию о чате');
      console.error('Ошибка загрузки чата:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await chatService.getChatMessages(chatId);
      setMessages(messagesData || []);
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      try {
        const messageData = {
          chat: parseInt(chatId),
          content: newMessage.trim()
        };
        
        if (replyingTo) {
          messageData.parent_message = replyingTo.id;
        }
        
        await chatService.sendMessage(messageData);
        setNewMessage('');
        setReplyingTo(null);
        loadMessages(); // Обновляем сообщения
      } catch (err) {
        console.error('Ошибка при отправке сообщения:', err);
        alert('Не удалось отправить сообщение');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      console.log('Выбран файл:', files[0].name);
      // Здесь будет логика загрузки файла
      alert('Прикрепление файлов будет реализовано позже');
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
      } else {
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      }
    } catch (error) {
      return '';
    }
  };

  // Функция для безопасного получения содержимого родительского сообщения
  const getParentMessageContent = (message) => {
    if (!message.parent_message) return '';
    
    // Проверяем разные возможные структуры данных
    const parentContent = message.parent_message.content || 
                         message.parent_message_content ||
                         '';
    
    return parentContent.length > 50 
      ? `${parentContent.substring(0, 50)}...`
      : parentContent;
  };

  // Функция для безопасного получения имени участника
  const getParticipantName = (participant) => {
    if (!participant) return 'Неизвестный пользователь';
    return participant.get_full_name || 
           `${participant.first_name || ''} ${participant.last_name || ''}`.trim() ||
           'Неизвестный пользователь';
  };

  // Функция для безопасного получения роли участника
  const getParticipantRole = (participant) => {
    if (!participant || !participant.role) return '';
    
    const roles = {
      'student': 'Студент',
      'teacher': 'Преподаватель',
      'director': 'Директор',
      'admin': 'Администратор'
    };
    
    return roles[participant.role] || participant.role;
  };

  // Функция для безопасного получения URL аватарки
  const getParticipantPhoto = (participant) => {
    if (!participant) return '/src/styles/images/default-avatar.png';
    return participant.photo || '/src/styles/images/default-avatar.png';
  };

  if (loading) {
    return (
      <MainLayout header={<div>Загрузка чата...</div>}>
        <div className="loading-screen">Загрузка сообщений...</div>
      </MainLayout>
    );
  }

  if (error || !chat) {
    return (
      <MainLayout header={<div>Ошибка</div>}>
        <div className="error-screen">
          {error || 'Чат не найден'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      header={
        <div className="chat-page-header">
          {headerParticipant && (
            <div className="header-participant-info">
              <img 
                src={getParticipantPhoto(headerParticipant)} 
                alt={getParticipantName(headerParticipant)}
                className="header-participant-avatar"
                onError={(e) => {
                  e.target.src = '/src/styles/images/default-avatar.png';
                }}
              />
              <div className="header-participant-details">
                <h2 className="header-participant-name">
                  {getParticipantName(headerParticipant)}
                </h2>
                <div className="header-participant-role">
                  {getParticipantRole(headerParticipant)}
                </div>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="chat-page-container">
        {/* Основное окно чата */}
        <div className="chat-window">
          {/* Область сообщений */}
          <div className="messages-area">
            {!messages || messages.length === 0 ? (
              <div className="empty-messages">
                Нет сообщений. Начните общение!
              </div>
            ) : (
              <div className="messages-container">
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.author === getCurrentUserId();
                  const showDate = index === 0 || 
                    (msg.created_at && messages[index - 1]?.created_at &&
                     formatDate(msg.created_at) !== formatDate(messages[index - 1].created_at));
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="date-divider">
                          <span>{formatDate(msg.created_at)}</span>
                        </div>
                      )}
                      
                      <div
                        className={`message ${isCurrentUser ? 'outgoing' : 'incoming'}`}
                        onClick={() => !isCurrentUser && handleReply(msg)}
                      >
                        {!isCurrentUser && otherParticipant && (
                          <div className="message-avatar">
                            <img 
                              src={getParticipantPhoto(otherParticipant)}
                              alt={getParticipantName(otherParticipant)}
                              onError={(e) => {
                                e.target.src = '/src/styles/images/default-avatar.png';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="message-content">
                          {msg.parent_message && (
                            <div className="reply-preview">
                              <div className="reply-text">
                                {getParentMessageContent(msg)}
                              </div>
                            </div>
                          )}
                          
                          <div className="message-text">{msg.content || ''}</div>
                          
                          {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                            <div className="message-attachments">
                              {msg.attachments.map(attachment => (
                                <a 
                                  key={attachment.id} 
                                  href={attachment.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="attachment-link"
                                >
                                  📎 {attachment.original_filename || 'Файл'}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          <div className="message-time">
                            {formatTime(msg.created_at)}
                            {isCurrentUser && (
                              <span className="message-status">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Панель ответа (если отвечаем на сообщение) */}
          {replyingTo && (
            <div className="reply-panel">
              <div className="reply-info">
                <span className="reply-label">Ответ на сообщение:</span>
                <span className="reply-text">
                  {replyingTo.content && replyingTo.content.length > 50 
                    ? `${replyingTo.content.substring(0, 50)}...`
                    : replyingTo.content || ''}
                </span>
              </div>
              <button className="cancel-reply" onClick={cancelReply}>×</button>
            </div>
          )}

          {/* Панель ввода сообщения */}
          <div className="input-area">
            <button 
              className="attach-file-btn" 
              title="Прикрепить файл"
              onClick={handleAttachFile}
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            
            <input
              type="text"
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="message-input"
            />
            
            <button 
              onClick={handleSend} 
              className="send-btn"
              disabled={!newMessage.trim()}
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PersonalChatPage;