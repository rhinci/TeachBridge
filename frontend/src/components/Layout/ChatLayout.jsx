import React from 'react';
import HeaderMain from '../HeaderMain';
import NavPanel from '../NavPanel';

export default function ChatLayout({ children, header, search }) {
  return (
    <div className="base-layout">
      <HeaderMain />
      <NavPanel /> 
      <main className="chat-layout-container">
        <div className='chat-layout'>
          {children}            
        </div>
      </main>
    </div>
  );
}