import React from 'react';
import Header from '../Header';

export default function BaseLayout({ children }) {
  return (
    <div className="base-layout">
      <Header />
      <main className="base-layout-main">
        {children}
      </main>
    </div>
  );
}