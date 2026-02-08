import React, { useState, useEffect } from 'react';
import { directorService } from '../../services/directorService';
import '../../styles/PendingRegistrations.css';

const PendingRegistrations = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Загружаем список заявок
  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    try {
      setLoading(true);
      const students = await directorService.getPendingRegistrations();
      setPendingStudents(students);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
      setError('Не удалось загрузить список заявок');
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение студента
  const handleApprove = async (userId, studentName) => {
    if (!window.confirm(`Подтвердить регистрацию студента ${studentName}?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      await directorService.approveStudent(userId);
      alert(`Студент ${studentName} успешно подтвержден!`);
      // Обновляем список
      await loadPendingRegistrations();
    } catch (err) {
      console.error('Ошибка подтверждения:', err);
      alert('Не удалось подтвердить студента');
    } finally {
      setProcessingId(null);
    }
  };

  // Отклонение студента
  const handleReject = async (userId, studentName) => {
    if (!window.confirm(`Отклонить регистрацию студента ${studentName}?`)) {
      return;
    }

    try {
      setProcessingId(userId);
      await directorService.rejectStudent(userId);
      alert(`Регистрация студента ${studentName} отклонена`);
      // Обновляем список
      await loadPendingRegistrations();
    } catch (err) {
      console.error('Ошибка отклонения:', err);
      alert('Не удалось отклонить студента');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="pending-registrations-loading">
        <div className="loading-spinner"></div>
        <div>Загрузка заявок...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-registrations-error">
        <div className="error-icon">⚠️</div>
        <div>{error}</div>
        <button 
          className="retry-btn"
          onClick={loadPendingRegistrations}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (pendingStudents.length === 0) {
    return (
      <div className="pending-registrations-empty">
        <div className="empty-icon">✅</div>
        <h3>Нет заявок на регистрацию</h3>
        <p>Все студенты вашего департамента подтверждены.</p>
      </div>
    );
  }

  return (
    <div className="pending-registrations-container">
      <div className="registrations-header">
        <h2>Заявки на регистрацию</h2>
        <div className="registrations-count">
          Всего: <span className="count-badge">{pendingStudents.length}</span>
        </div>
      </div>

      <div className="registrations-list">
        {pendingStudents.map(student => (
          <div key={student.id} className="registration-card">
            <div className="student-info">
              <div className="student-main">
                <div className="student-name">{student.get_full_name}</div>
                <div className="student-email">{student.email}</div>
              </div>
              
              <div className="student-details">
                {student.study_group && (
                  <div className="student-group">
                    <span className="detail-label">Группа:</span>
                    <span className="detail-value">{student.study_group.code}</span>
                  </div>
                )}
                
                {student.department && (
                  <div className="student-department">
                    <span className="detail-label">Департамент:</span>
                    <span className="detail-value">{student.department.name}</span>
                  </div>
                )}
                
                <div className="student-date">
                  <span className="detail-label">Дата регистрации:</span>
                  <span className="detail-value">
                    {new Date(student.date_joined || student.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>

            <div className="registration-actions">
              <button
                className="approve-btn"
                onClick={() => handleApprove(student.id, student.get_full_name)}
                disabled={processingId === student.id}
              >
                {processingId === student.id ? (
                  <>
                    <span className="action-spinner"></span>
                    Подтверждение...
                  </>
                ) : 'Подтвердить'}
              </button>
              
              <button
                className="reject-btn"
                onClick={() => handleReject(student.id, student.get_full_name)}
                disabled={processingId === student.id}
              >
                {processingId === student.id ? (
                  <>
                    <span className="action-spinner"></span>
                    Отклонение...
                  </>
                ) : 'Отклонить'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRegistrations;