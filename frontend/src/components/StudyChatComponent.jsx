import React from 'react';
import '../styles/StudyChatComponent.css'

const StudyChatComponent = () => {
  return (
    <div className='study-chat-component'>
        <div className='study-chat-icon'>
            <img src="/src/styles/images/test1.jpg" alt="Chat icon" />
        </div>
        <div className='study-chat-info'>
            <div className='study-chat-name'>This is a chat name</div>
            <div className='study-chat-section'>#This is a chat section</div>
            <div className='study-chat-latest-message'>This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message </div>
        </div>
        <div className='study-chat-messages'>
            <div className='study-message-count'>5</div>
        </div>
    </div>
  );
};

export default StudyChatComponent;