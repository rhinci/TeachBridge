import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatLayout from '../components/Layout/ChatLayout';
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

  const loadChatData = async () => {
    try {
      setLoading(true);
      const chatData = await chatService.getChatById(chatId);
      setChat(chatData);
      
      // Находим собеседника
      const currentUserId = parseInt(localStorage.getItem('user_id'));
      const other = chatData.participants_info?.find(p => p.id !== currentUserId);
      setOtherParticipant(other);
      
    } catch (err) {
      setError('Не удалось загрузить информацию о чате');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await chatService.getChatMessages(chatId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim()) {
      try {
        await chatService.sendMessage({
          chat: chatId,
          content: newMessage.trim()
        });
        setNewMessage('');
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

  if (loading) {
    return (
      <ChatLayout>
        <div className="loading">Загрузка чата...</div>
      </ChatLayout>
    );
  }

  if (error || !chat || !otherParticipant) {
    return (
      <ChatLayout>
        <div className="error">
          {error || 'Чат не найден'}
        </div>
      </ChatLayout>
    );
  }

  return (
    <ChatLayout>
      {/* Хедер с информацией о собеседнике */}
      <div className="personal-chat-header">
        <div className="participant-info">
          <img 
            src={otherParticipant.photo || '/src/styles/images/default-avatar.png'} 
            alt={otherParticipant.get_full_name}
            className="participant-avatar"
            onError={(e) => {
              e.target.src = '/src/styles/images/default-avatar.png';
            }}
          />
          <div className="participant-details">
            <h2 className="participant-name">{otherParticipant.get_full_name}</h2>
            <div className="participant-role">
              {otherParticipant.role === 'student' ? 'Студент' :
               otherParticipant.role === 'teacher' ? 'Преподаватель' :
               otherParticipant.role === 'director' ? 'Директор' : 'Администратор'}
            </div>
          </div>
        </div>
      </div>

      {/* Окно сообщений */}
      <div className="chat-messages-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-messages">
              Нет сообщений. Начните общение!
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.author === parseInt(localStorage.getItem('user_id')) ? 'outgoing' : 'incoming'}`}
              >
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="message-attachments">
                      {msg.attachments.map(attachment => (
                        <div key={attachment.id} className="attachment">
                          📎 {attachment.original_filename}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.author === parseInt(localStorage.getItem('user_id')) && (
                    <span className="message-status">✓</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Панель ввода сообщения */}
      <div className="chat-input-container">
        <button className="attach-file-btn" title="Прикрепить файл">
          📎
        </button>
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
    </ChatLayout>
  );
};

export default PersonalChatPage;