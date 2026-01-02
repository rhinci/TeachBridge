import React from 'react';
import '../styles/ProfileInfo.css'

const ProfileInfo = () => {
  return (
    <div className='info-container'>
        <div className='info-section'>
            <div className='info-section-type'>ФИО</div>
            <div className='info-section-content'>Name Name</div>
        </div>
        <div className='info-section'>
            <div className='info-section-type'>Роль</div>
            <div className='info-section-content'>Role</div>
        </div>
        <div className='info-section'>
            <div className='info-section-type'>Учебная группа</div>
            <div className='info-section-content'>Group number</div>
        </div>
        <div className='info-section'>
            <div className='info-section-type'>Корпоративная почта</div>
            <div className='info-section-content'>Email</div>
        </div>
    </div>
  );
};

export default ProfileInfo;