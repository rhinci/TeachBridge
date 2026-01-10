import api from '../services/api';

export const getCurrentUser = () => {
  return api.get('/auth/users/me/');
};

export const updateUserPhoto = (formData) => {
  return api.patch('/auth/users/me/', formData, {
    headers: {
      'Content-Type': undefined,
    },
  });
};