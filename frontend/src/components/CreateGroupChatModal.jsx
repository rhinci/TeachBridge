import React, { useState, useEffect } from 'react';
import '../styles/CreateGroupChatModal.css';

const CreateGroupChatModal = ({ isOpen, onClose, onCreate, teachers, studyGroups, departmentId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teachers: [],
    study_groups: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Сбрасываем форму при открытии
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        teachers: [],
        study_groups: []
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      setError('Название чата обязательно');
      return;
    }

    if (formData.name.trim().length < 3) {
      setError('Название должно содержать минимум 3 символа');
      return;
    }

    if (!formData.study_groups.length && !formData.teachers.length) {
      setError('Выберите хотя бы одну учебную группу или преподавателя');
      return;
    }

    if (formData.teachers.length > 2) {
      setError('Можно выбрать не более 2 преподавателей');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await onCreate(formData);
      
    } catch (err) {
      console.error('Ошибка при создании чата:', err);
      setError(err.response?.data?.error || 'Не удалось создать чат');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTeacherToggle = (teacherId) => {
    setFormData(prev => {
      const isSelected = prev.teachers.includes(teacherId);
      if (isSelected) {
        return {
          ...prev,
          teachers: prev.teachers.filter(id => id !== teacherId)
        };
      } else {
        // Проверяем лимит в 2 преподавателя
        if (prev.teachers.length >= 2) {
          setError('Можно выбрать не более 2 преподавателей');
          return prev;
        }
        return {
          ...prev,
          teachers: [...prev.teachers, teacherId]
        };
      }
    });
    setError('');
  };

  const handleGroupToggle = (groupId) => {
    setFormData(prev => {
      const isSelected = prev.study_groups.includes(groupId);
      if (isSelected) {
        return {
          ...prev,
          study_groups: prev.study_groups.filter(id => id !== groupId)
        };
      } else {
        return {
          ...prev,
          study_groups: [...prev.study_groups, groupId]
        };
      }
    });
    setError('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-group-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Создать учебный чат</h2>
          <button className="modal-close-btn" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="modal-body">
            
            {/* Основная информация */}
            <div className="form-section">
              <h3 className="section-title">Основная информация</h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Название чата <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Например: Математический анализ, Веб-разработка"
                  className={`form-input ${error && !formData.name ? 'error' : ''}`}
                  disabled={loading}
                  autoFocus
                />
                <div className="form-hint">
                  Название будет отображаться в списке чатов
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Описание (необязательно)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Опишите назначение чата, темы для обсуждения..."
                  className="form-textarea"
                  disabled={loading}
                  rows="3"
                />
              </div>
            </div>

            {/* Преподаватели */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Преподаватели</h3>
                <span className="section-subtitle">Можно выбрать до 2 преподавателей</span>
              </div>
              
              {error && formData.teachers.length > 2 && (
                <div className="form-error">{error}</div>
              )}
              
              {teachers && teachers.length > 0 ? (
                <div className="selection-grid">
                  {teachers.map(teacher => (
                    <div 
                      key={teacher.id}
                      className={`selection-item ${formData.teachers.includes(teacher.id) ? 'selected' : ''}`}
                      onClick={() => handleTeacherToggle(teacher.id)}
                    >
                      <div className="item-avatar">
                        <img 
                          src={teacher.photo || '/src/styles/images/default-avatar.png'} 
                          alt={teacher.get_full_name}
                        />
                      </div>
                      <div className="item-info">
                        <div className="item-name">{teacher.get_full_name}</div>
                        <div className="item-role">
                          {teacher.role === 'teacher' ? 'Преподаватель' : 'Директор'}
                        </div>
                      </div>
                      <div className="item-checkbox">
                        <div className="checkbox-indicator"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-selection">
                  <div className="empty-icon">👨‍🏫</div>
                  <div className="empty-text">Нет преподавателей в департаменте</div>
                </div>
              )}
            </div>

            {/* Учебные группы */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Учебные группы</h3>
                <span className="section-subtitle">Выберите группы, которые будут участвовать в чате</span>
              </div>
              
              {error && !formData.study_groups.length && !formData.teachers.length && (
                <div className="form-error">{error}</div>
              )}
              
              {studyGroups && studyGroups.length > 0 ? (
                <div className="selection-grid compact">
                  {studyGroups.map(group => (
                    <div 
                      key={group.id}
                      className={`selection-item ${formData.study_groups.includes(group.id) ? 'selected' : ''}`}
                      onClick={() => handleGroupToggle(group.id)}
                    >
                      <div className="item-icon">👥</div>
                      <div className="item-info">
                        <div className="item-name">{group.name || group.code}</div>
                        {group.student_count !== undefined && (
                          <div className="item-detail">{group.student_count} студентов</div>
                        )}
                      </div>
                      <div className="item-checkbox">
                        <div className="checkbox-indicator"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-selection">
                  <div className="empty-icon">👥</div>
                  <div className="empty-text">Нет учебных групп в департаменте</div>
                </div>
              )}
            </div>

            {/* Общие ошибки */}
            {error && !formData.teachers.length > 2 && formData.study_groups.length && (
              <div className="form-error general">{error}</div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="modal-btn cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="modal-btn create-btn"
              disabled={loading || !formData.name.trim() || (!formData.study_groups.length && !formData.teachers.length)}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Создание...
                </>
              ) : 'Создать чат'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupChatModal;