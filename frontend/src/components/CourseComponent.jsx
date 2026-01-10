import React from 'react';
import '../styles/CourseComponent.css'

const CourseComponent = () => {
  return (
    <div className='course-component'>
        <div className='course-info-container'>
            <div className='course-image'>
                <img src="/src/styles/images/test1.jpg" alt="Chat icon" />
            </div>
            <div className='course-info'>
                <div className='course-name'>Course name</div>
                <div className='course-author'>Author of the course</div>
            </div>
        </div>
        <div className='course-description'>Course description Course description Course description Course description </div>
    </div>
  );
};

export default CourseComponent;