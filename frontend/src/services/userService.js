import api from './api';

export const userService = {
  /**
   * Получить пользователя по ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/auth/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении пользователя ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Поиск пользователей
   */
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/auth/users/search/?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
      throw error;
    }
  },

  /**
   * Получить пользователей по департаменту
   */
  getUsersByDepartment: async (departmentId, role = null) => {
    try {
      let url = `/director/department-users/`;
      const params = new URLSearchParams();
      if (departmentId) params.append('department_id', departmentId);
      if (role) params.append('role', role);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении пользователей департамента:', error);
      throw error;
    }
  },

  /**
   * Получить студентов по группе
   */
  getStudentsByGroup: async (groupId) => {
    try {
      const response = await api.get(`/auth/study-groups/${groupId}/students/`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении студентов группы ${groupId}:`, error);
      throw error;
    }
  }
};