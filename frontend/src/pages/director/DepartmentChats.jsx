import React, { useState, useEffect } from 'react';
import CreateGroupChatModal from '../../components/CreateGroupChatModal';
import { directorService } from '../../services/directorService';
import { chatService } from '../../services/chatService';
import '../../styles/DepartmentChats.css';

const DepartmentChats = () => {
  const [departmentChats, setDepartmentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);

  // Загружаем данные
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем информацию о департаменте
      const deptInfo = await directorService.getDepartmentInfo();
      setDepartmentInfo(deptInfo);
      
      // Загружаем чаты департамента
      const chats = await directorService.getDepartmentChats();
      setDepartmentChats(chats);
      
      // Загружаем преподавателей и группы департамента
      await loadDepartmentResources();
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные департамента');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentResources = async () => {
    try {
      // Загружаем преподавателей департамента
      const teachersList = await directorService.getDepartmentUsers('teacher');
      setTeachers(teachersList);
      
      // Загружаем учебные группы департамента
      if (departmentInfo?.study_groups) {
        setStudyGroups(departmentInfo.study_groups);
      }
    } catch (err) {
      console.error('Ошибка загрузки ресурсов:', err);
    }
  };

  // Создание нового чата
  const handleCreateChat = async (chatData) => {
    try {
      const newChat = await directorService.createGroupChat(chatData);
      
      // Обновляем список чатов
      await loadData();
      
      // Закрываем модальное окно
      setIsCreateModalOpen(false);
      
      alert(`Чат "${newChat.name}" успешно создан!`);
      
      // Можно автоматически перейти в созданный чат
      // window.location.href = `/study-chat/${newChat.id}`;
      
    } catch (err) {
      console.error('Ошибка создания чата:', err);
      const errorMsg = err.response?.data?.error || 'Не удалось создать чат';
      alert(`Ошибка: ${errorMsg}`);
      throw err;
    }
  };

  // Переход в чат
  const handleOpenChat = (chatId) => {
    window.location.href = `/study-chat/${chatId}`;
  };

  if (loading) {
    return (
      <div className="department-chats-loading">
        <div className="loading-spinner"></div>
        <div>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-chats-error">
        <div className="error-icon">⚠️</div>
        <div>{error}</div>
        <button 
          className="retry-btn"
          onClick={loadData}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="department-chats-container">
      <div className="department-header">
        <div className="department-info">
          <h2>Учебные чаты департамента</h2>
          <div className="department-stats">
            <span className="stat-item">
              <span className="stat-label">Департамент:</span>
              <span className="stat-value">{departmentInfo?.department?.name || 'Не указан'}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Чатов:</span>
              <span className="stat-value">{departmentChats.length}</span>
            </span>
          </div>
        </div>
        
        <button 
          className="create-chat-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Создать учебный чат
        </button>
      </div>

      {departmentChats.length === 0 ? (
        <div className="department-chats-empty">
          <div className="empty-icon">💬</div>
          <h3>Нет учебных чатов</h3>
          <p>Создайте первый учебный чат для вашего департамента.</p>
          <button 
            className="create-first-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Создать первый чат
          </button>
        </div>
      ) : (
        <div className="chats-grid">
          {departmentChats.map(chat => (
            <div 
              key={chat.id} 
              className="department-chat-card"
              onClick={() => handleOpenChat(chat.id)}
            >
              <div className="chat-header">
                <div className="chat-avatar">
                  <img 
                    src={chat.avatar || chat.display_avatar || '/src/styles/images/default-group-avatar.png'} 
                    alt={chat.name}
                  />
                </div>
                <div className="chat-title-section">
                  <h3 className="chat-title">{chat.name}</h3>
                  {chat.description && (
                    <p className="chat-description">{chat.description}</p>
                  )}
                </div>
              </div>
              
              <div className="chat-stats">
                <div className="stat">
                  <span className="stat-icon">👥</span>
                  <span className="stat-text">{chat.participants?.length || 0} участников</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📚</span>
                  <span className="stat-text">{chat.section_count || 0} разделов</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">👨‍🏫</span>
                  <span className="stat-text">{chat.teachers_info?.length || 0} преподавателей</span>
                </div>
              </div>
              
              <div className="chat-groups">
                <div className="groups-label">Учебные группы:</div>
                <div className="groups-list">
                  {chat.study_groups_info?.slice(0, 3).map(group => (
                    <span key={group.id} className="group-tag">{group.code}</span>
                  ))}
                  {chat.study_groups_info?.length > 3 && (
                    <span className="group-more">+{chat.study_groups_info.length - 3}</span>
                  )}
                  {(!chat.study_groups_info || chat.study_groups_info.length === 0) && (
                    <span className="no-groups">Нет групп</span>
                  )}
                </div>
              </div>
              
              <div className="chat-actions">
                <button 
                  className="open-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChat(chat.id);
                  }}
                >
                  Перейти в чат
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания чата */}
      <CreateGroupChatModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateChat}
        departmentId={departmentInfo?.department?.id}
        teachers={teachers}
        studyGroups={studyGroups}
      />
    </div>
  );
};

export default DepartmentChats;