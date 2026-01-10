import React from 'react';
import ChatLayout from '../components/Layout/ChatLayout';
import '../styles/StudyChatPage.css'

const StudyChatPage = () => {
  const [messages] = useState([
    { id: 1, text: 'Привет! Как дела?', sender: 'user', time: '10:05' },
    { id: 2, text: 'Нормально, а у тебя?', sender: 'other', time: '10:06' },
    { id: 3, text: 'Готовлюсь к лабе по Django', sender: 'user', time: '10:07' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      // Здесь можно вызвать API для отправки
      console.log('Отправка:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <ChatLayout>
          {/* Левое меню */}
          <aside className="sidebar-left">
            <nav className="chat-nav">
              {['Информация', 'Материалы', 'Флудилка', 'Вопросы'].map((item) => (
                <div key={item} className="chat-nav-item">
                  {item}
                </div>
              ))}
            </nav>
          </aside>

          {/* Центральный чат */}
          <main className="chat-main">
            <div className="chat-header">
              <h2 className="chat-title">Флудилка</h2>
            </div>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.sender === 'user' ? 'outgoing' : 'incoming'}`}
                >
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Напишите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={handleSend}>Отправить</button>
            </div>
          </main>

          {/* Правая панель */}
          <aside className="sidebar-right">
            <div className="participants">
              <h3>Участники</h3>
              {['Алексей', 'Мария', 'Дмитрий', 'Вы'].map((name, i) => (
                <div key={i} className="participant">
                  <span className="participant-name">{name}</span>
                </div>
              ))}
            </div>

            <div className="courses">
              <h3>Ваши курсы</h3>
              {[
                { title: 'Веб-разработка', progress: 75 },
                { title: 'Алгоритмы', progress: 40 },
                { title: 'Базы данных', progress: 90 },
              ].map((course, i) => (
                <div key={i} className="course-item">
                  <div className="course-icon"></div>
                  <div className="course-info">
                    <div className="course-title">{course.title}</div>
                    <div className="course-progress">
                      Прогресс: {course.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
    </ChatLayout>
  );
};

export default StudyChatPage;