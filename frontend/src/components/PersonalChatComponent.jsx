import React from 'react';
import '../styles/PersonalChatComponent.css'

const PersonalChatComponent = () => {
  return (
    <div className='personal-chat-component'>
        <div className='personal-chat-icon'>
            <img src="/src/styles/images/test1.jpg" alt="Chat icon" />
        </div>
        <div className='personal-chat-info'>
            <div className='personal-chat-name-role'>
                <div className='personal-chat-name'>Another user's name</div>
                <div className='dot'> • </div>
                <div className='personal-chat-role'>Role</div>                
            </div>

            <div className='personal-chat-latest-message'>This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message This is latest message </div>
        </div>
        <div className='personal-chat-messages'>
            <div className='personal-message-count'>2</div>
        </div>
    </div>
  );
};

export default PersonalChatComponent;