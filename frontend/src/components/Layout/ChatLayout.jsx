import React from 'react';
import HeaderMain from '../HeaderMain';
import NavPanel from '../NavPanel';
import "../../styles/ChatLayout.css";

export default function ChatLayout({ children }) {
  return (
    <div className="chat-layout">
      <HeaderMain />
      <NavPanel />
      <main className="chat-layout-main">
        {children}
      </main>
    </div>
  );
}