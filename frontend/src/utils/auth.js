export const authService = {
  // Сохранить данные пользователя после логина
  saveUserData: (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_id', data.user.id.toString());
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('user_role', data.user.role);
    }
  },
  
  // Получить текущего пользователя
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
      return null;
    }
  },
  
  // Получить ID текущего пользователя
  getCurrentUserId: () => {
    const user = authService.getCurrentUser();
    return user ? user.id : null;
  },
  
  // Проверить, авторизован ли пользователь
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
  
  // Выйти
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  }
};