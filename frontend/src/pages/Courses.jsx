import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import CourseComponent from '../components/CourseComponent';

const Courses = () => {
  return (
    <MainLayout
      header={<div>Курсы</div>}
    >
      <div className='input-button-container'>
        <div className='search-input-wrapper-course'>
          <input placeholder="Поиск курса" />
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button className='button-my-courses'>Мои</button>
        <button className='button-all-courses'>Все</button>
      </div>


      <div className='courses-container'>
        <CourseComponent />
        <CourseComponent />
        <CourseComponent />        
      </div>

    </MainLayout>
  );
};

export default Courses;