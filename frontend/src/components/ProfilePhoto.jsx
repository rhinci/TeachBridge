import React from 'react';
import '../styles/ProfilePhoto.css'

const ProfilePhoto = () => {
  return (
    <div className='photo-card'>
        <div className='profile-photo'><img src="/src/styles/images/test1.jpg" alt="photo" /></div>
        <button className='btn-change-photo'>Изменить фотографию</button>
    </div>
  );
};

export default ProfilePhoto;