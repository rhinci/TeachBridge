import api from './api';

export const directorService = {
  /**
   * Получить неподтвержденных студентов департамента
   */
  getPendingRegistrations: async () => {
    try {
      const response = await api.get('/director/pending-registrations/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении заявок:', error);
      throw error;
    }
  },

  /**
   * Подтвердить студента
   */
  approveStudent: async (userId) => {
    try {
      const response = await api.post(`/director/users/${userId}/approve/`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при подтверждении студента:', error);
      throw error;
    }
  },

  /**
   * Отклонить студента
   */
  rejectStudent: async (userId) => {
    try {
      const response = await api.post(`/director/users/${userId}/reject/`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при отклонении студента:', error);
      throw error;
    }
  },

  /**
   * Получить информацию о департаменте директора
   */
  getDepartmentInfo: async () => {
    try {
      const response = await api.get('/director/department-info/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о департаменте:', error);
      throw error;
    }
  },

  /**
   * Получить все чаты департамента
   */
  getDepartmentChats: async () => {
    try {
      const response = await api.get('/director/department-chats/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении чатов департамента:', error);
      throw error;
    }
  },

  /**
   * Создать учебный чат
   */
  createGroupChat: async (chatData) => {
    try {
      const response = await api.post('/director/group-chats/create/', chatData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      throw error;
    }
  },

  /**
   * Получить пользователей департамента по роли
   */
  getDepartmentUsers: async (role = null) => {
    try {
      let url = '/director/department-users/';
      if (role) {
        url += `?role=${role}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении пользователей департамента:', error);
      throw error;
    }
  },

  /**
   * Получить все курсы департамента
   */
  getDepartmentCourses: async () => {
    try {
      const response = await api.get('/director/department-courses/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении курсов департамента:', error);
      throw error;
    }
  }
};