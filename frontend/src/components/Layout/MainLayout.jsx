import React from 'react';
import HeaderMain from '../HeaderMain';
import NavPanel from '../NavPanel';

export default function BaseLayout({ children }) {
  return (
    <div className="base-layout">
      <HeaderMain />
      <NavPanel />
      <main className="main-layout">
        {children}
      </main>
    </div>
  );
}