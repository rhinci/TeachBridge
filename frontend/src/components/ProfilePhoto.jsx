import React, { useState, useEffect, useRef } from 'react';
import '../styles/ProfilePhoto.css';
import { getCurrentUser, updateUserPhoto } from '../services/profileService';

const API_BASE_URL = 'http://localhost:8000'; 

const ProfilePhoto = () => {
  const [photoUrl, setPhotoUrl] = useState('/src/styles/images/avatar.png');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await getCurrentUser();
        const user = response.data;

        if (user.photo) {
          const fullPhotoUrl = `${API_BASE_URL}${user.photo}`;
          setPhotoUrl(fullPhotoUrl);
        }
      } catch (error) {
        console.error('Ошибка загрузки фото:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение (JPG, PNG)');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await updateUserPhoto(formData);
      const newPhotoUrl = response.data.photo;
      setPhotoUrl(newPhotoUrl);
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      alert('Не удалось загрузить фотографию. Попробуйте ещё раз.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='photo-card'>
      <div className='profile-photo'>
        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <img
            src={photoUrl}
            alt="Фотография профиля"
            onError={() => setPhotoUrl('/src/styles/images/avatar.png')}
          />
        )}
      </div>

      <button className='btn-change-photo' onClick={triggerFileInput}>
        Изменить фотографию
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ProfilePhoto;