import React, { useState } from 'react';
import '../styles/CreateSectionModal.css';

const CreateSectionModal = ({ isOpen, onClose, onCreate, chatId, chatName }) => {
  const [sectionName, setSectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Проверяем, что модальное окно открыто
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!sectionName.trim()) {
      setError('Название раздела обязательно');
      return;
    }

    if (sectionName.trim().length < 2) {
      setError('Название должно содержать минимум 2 символа');
      return;
    }

    if (sectionName.trim().length > 100) {
      setError('Название слишком длинное (макс. 100 символов)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Вызываем callback с данными нового раздела
      await onCreate({
        name: sectionName.trim(),
        chat: chatId
      });
      
      // Сбрасываем форму и закрываем модальное окно
      setSectionName('');
      onClose();
      
    } catch (err) {
      console.error('Ошибка при создании раздела:', err);
      setError(err.response?.data?.detail || 'Не удалось создать раздел');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSectionName('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-section-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Создать новый раздел</h2>
          <button className="modal-close-btn" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-info">
            <span className="info-label">Чат:</span>
            <span className="info-value">{chatName}</span>
          </div>
          
          <form onSubmit={handleSubmit} className="section-form">
            <div className="form-group">
              <label htmlFor="sectionName" className="form-label">
                Название раздела <span className="required">*</span>
              </label>
              <input
                id="sectionName"
                type="text"
                value={sectionName}
                onChange={(e) => {
                  setSectionName(e.target.value);
                  setError('');
                }}
                placeholder="Например: Вопросы по ДЗ, Обсуждение темы, Новости"
                className={`form-input ${error ? 'error' : ''}`}
                disabled={loading}
                autoFocus
              />
              <div className="form-hint">
                Название будет отображаться с символом # (например: #{sectionName})
              </div>
              {error && <div className="form-error">{error}</div>}
            </div>
          </form>
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
            onClick={handleSubmit}
            disabled={loading || !sectionName.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Создание...
              </>
            ) : 'Создать раздел'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSectionModal;