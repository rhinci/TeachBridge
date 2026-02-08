import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { chatService } from '../services/chatService';
import '../styles/StudyChatPage.css';

const StudyChatPage = () => {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sections, setSections] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [attachedCourses, setAttachedCourses] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  // Загружаем информацию о чате
  useEffect(() => {
    if (chatId) {
      loadChatData();
    }
  }, [chatId]);

  // Polling для сообщений (каждые 5 секунд)
  useEffect(() => {
    if (chatId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatId, activeSection]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      
      // Загружаем основную информацию о чате
      const chatData = await chatService.getChatById(chatId);
      setChat(chatData);
      
      // Загружаем разделы чата
      const sectionsData = await chatService.getChatSections(chatId);
      setSections(sectionsData);
      
      // Устанавливаем активный раздел (первый или #general)
      if (sectionsData.length > 0) {
        const generalSection = sectionsData.find(s => s.name === '#general');
        setActiveSection(generalSection || sectionsData[0]);
      }
      
      // Загружаем участников из данных чата
      if (chatData.participants_info) {
        setParticipants(chatData.participants_info);
      } else {
        const participantsData = await chatService.getChatParticipants(chatId);
        setParticipants(participantsData);
      }
      
      // Загружаем прикрепленные курсы
      if (chatData.attached_courses_info) {
        setAttachedCourses(chatData.attached_courses_info);
      } else {
        const coursesData = await chatService.getChatCourses(chatId);
        setAttachedCourses(coursesData);
      }
      
    } catch (err) {
      console.error('Error loading chat data:', err);
      setError('Не удалось загрузить информацию о чате');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const sectionId = activeSection?.id || null;
      const messagesData = await chatService.getChatMessages(chatId, sectionId);
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
          section: activeSection?.id,
          content: newMessage.trim()
        });
        setNewMessage('');
        loadMessages();
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
  const canCreateSections = ['teacher', 'director', 'admin'].includes(userRole);

  if (loading) {
    return (
      <MainLayout header="Загрузка чата...">
        <div className="study-chat-loading">Загрузка чата...</div>
      </MainLayout>
    );
  }

  if (error || !chat) {
    return (
      <MainLayout header="Ошибка">
        <div className="study-chat-error">
          {error || 'Чат не найден'}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      header={chat.name}
      search={
        <div className="search-container">
          <input 
            placeholder="Поиск в чате..." 
            disabled
          />
        </div>
      }
    >
      <div className="study-chat-page-wrapper">
        <div className="study-chat-grid">
          
          {/* Левая колонка: Разделы */}
          <div className="study-chat-left">
            <div className="study-sections-card">
              <div className="study-card-header">
                <h3>Разделы чата</h3>
                {canCreateSections && (
                  <button 
                    className="study-create-btn"
                    onClick={() => alert('Функционал создания раздела в разработке')}
                  >
                    + Создать
                  </button>
                )}
              </div>
              
              <div className="study-sections-list">
                {sections.map(section => (
                  <div 
                    key={section.id}
                    className={`study-section-item ${activeSection?.id === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    <div className="study-section-name"># {section.name}</div>
                    <div className="study-section-count">{section.message_count || 0} сообщ.</div>
                  </div>
                ))}
                
                {sections.length === 0 && (
                  <div className="study-no-sections">
                    Пока нет разделов
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Центральная колонка: Чат */}
          <div className="study-chat-center">
            <div className="study-chat-main-card">
              {/* Хедер чата */}
              <div className="study-chat-header">
                <div className="study-chat-info">
                  <div className="study-chat-avatar">
                    <img 
                      src={chat.avatar || chat.display_avatar || '/src/styles/images/default-group-avatar.png'} 
                      alt={chat.name}
                      onError={(e) => {
                        e.target.src = '/src/styles/images/default-group-avatar.png';
                      }}
                    />
                  </div>
                  <div className="study-chat-details">
                    <h2 className="study-chat-title">{chat.name}</h2>
                    <div className="study-chat-subtitle">
                      {chat.department?.name && (
                        <span className="study-department">{chat.department.name}</span>
                      )}
                      {activeSection && (
                        <span className="study-active-section">#{activeSection.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Окно сообщений */}
              <div className="study-messages-window">
                {messages.length === 0 ? (
                  <div className="study-empty-messages">
                    <div className="study-empty-icon">💬</div>
                    <div className="study-empty-text">Нет сообщений в этом разделе</div>
                    <div className="study-empty-subtext">Начните общение!</div>
                  </div>
                ) : (
                  <div className="study-messages-list">
                    {messages.map(msg => {
                      const isOwnMessage = msg.author === parseInt(localStorage.getItem('user_id'));
                      
                      return (
                        <div
                          key={msg.id}
                          className={`study-message ${isOwnMessage ? 'outgoing' : 'incoming'}`}
                        >
                          {!isOwnMessage && (
                            <div className="study-message-author">
                              <img 
                                src={msg.author_info?.photo || '/src/styles/images/default-avatar.png'} 
                                alt={msg.author_info?.get_full_name}
                                className="study-author-avatar"
                              />
                              <div className="study-author-details">
                                <div className="study-author-name" 
                                     onClick={() => window.location.href = `/profile/${msg.author_info?.id}`}
                                     style={{ cursor: 'pointer' }}>
                                  {msg.author_info?.get_full_name || 'Неизвестный'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="study-message-content">
                            <div className="study-message-text">{msg.content}</div>
                            
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="study-message-attachments">
                                {msg.attachments.map(attachment => (
                                  <a 
                                    key={attachment.id}
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="study-attachment-link"
                                  >
                                    <span className="study-attachment-icon">📎</span>
                                    <span className="study-attachment-name">{attachment.original_filename}</span>
                                    <span className="study-attachment-size">({attachment.human_file_size})</span>
                                  </a>
                                ))}
                              </div>
                            )}
                            
                            <div className="study-message-footer">
                              <span className="study-message-time">
                                {new Date(msg.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Панель ввода */}
              <div className="study-input-panel">
                <button className="study-attach-btn" title="Прикрепить файл">
                  <span className="study-attach-icon">📎</span>
                </button>
                <input
                  type="text"
                  placeholder={`Напишите сообщение ${activeSection ? `в #${activeSection.name}` : ''}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="study-message-input"
                />
                <button 
                  onClick={handleSend} 
                  className="study-send-btn"
                  disabled={!newMessage.trim()}
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>

          {/* Правая колонка: Участники и курсы */}
          <div className="study-chat-right">
            {/* Участники чата */}
            <div className="study-participants-card">
              <div className="study-card-header">
                <h3>Участники</h3>
                <span className="study-count-badge">{participants.length}</span>
              </div>
              
              <div className="study-participants-list">
                {participants.map(participant => {
                  const roleText = 
                    participant.role === 'student' ? 'Студент' :
                    participant.role === 'teacher' ? 'Преподаватель' :
                    participant.role === 'director' ? 'Директор' : 'Администратор';
                  
                  return (
                    <div 
                      key={participant.id}
                      className="study-participant-item"
                      onClick={() => window.location.href = `/profile/${participant.id}`}
                      title={`${participant.get_full_name} - ${roleText}`}
                    >
                      <img 
                        src={participant.photo || '/src/styles/images/default-avatar.png'} 
                        alt={participant.get_full_name}
                        className="study-participant-avatar"
                      />
                      <div className="study-participant-info">
                        <div className="study-participant-name">{participant.get_full_name}</div>
                        <div className="study-participant-role">{roleText}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Прикрепленные курсы */}
            <div className="study-courses-card">
              <div className="study-card-header">
                <h3>Курсы</h3>
              </div>
              
              <div className="study-courses-list">
                {attachedCourses.length === 0 ? (
                  <div className="study-empty-courses">
                    <div className="study-course-icon">📚</div>
                    <div className="study-course-text">Функционал курсов в доработке</div>
                  </div>
                ) : (
                  attachedCourses.map(course => (
                    <div 
                      key={course.id}
                      className="study-course-item"
                      onClick={() => window.location.href = `/courses/${course.id}`}
                      title={course.title}
                    >
                      <div className="study-course-icon">📚</div>
                      <div className="study-course-details">
                        <div className="study-course-title">{course.title}</div>
                        <div className="study-course-description">
                          {course.short_description || 'Описание отсутствует'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudyChatPage;