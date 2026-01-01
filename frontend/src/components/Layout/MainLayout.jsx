import React from 'react';
import HeaderMain from '../HeaderMain';
import NavPanel from '../NavPanel';

export default function MainLayout({ children, header, search }) {
  return (
    <div className="base-layout">
      <HeaderMain />
      <NavPanel /> 
      <main className="main-layout">
        <div className='main-block-page'>
          {header && <div className='custom-header'>{header}</div>}
          {search && <div className="search-input-wrapper">{search}</div>}

          <div className='main-content'>
            {children}            
          </div>
        </div>

      </main>
    </div>
  );
}