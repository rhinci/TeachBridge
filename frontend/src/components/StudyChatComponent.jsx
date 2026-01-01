import React from 'react';

const StudyChatComponent = () => {
  return (
    <div className='study-chat-component'>
        <div className='study-chat-icon'>
            <img src="/src/styles/images/study-chats-inactive.png" alt="Chat icon" />
        </div>
        <div className='study-chat-info'>
            <div className='chat-name'>This is a chat name</div>
            <div className='chat-section'>#This is a chat section</div>
            <div className='chat-latest-message'>This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message </div>
        </div>
        <div className='study-chat-messages'>
            <div className='message-count'>5</div>
        </div>
    </div>
  );
};

export default StudyChatComponent;