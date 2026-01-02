import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import ProfilePhoto from '../components/ProfilePhoto';
import ProfileInfo from '../components/ProfileInfo';

const Profile = () => {
  return (

    <div className='profile-wrapper'>
          <MainLayout
      header={<div>Мой профиль</div>}
    >
      <div className='profile-container'>
        <ProfilePhoto />
        <ProfileInfo />
      </div>
    </MainLayout>
    </div>


  );
};

export default Profile;