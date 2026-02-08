import api from './api';

export const chatService = {
  /**
   * Получить все чаты пользователя
   */
  getChats: async () => {
    try {
      const response = await api.get('/chats/chats/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении чатов:', error);
      throw error;
    }
  },

  /**
   * Получить только личные чаты
   */
  getPersonalChats: async () => {
    try {
      const response = await api.get('/chats/chats/personal_chats/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении личных чатов:', error);
      throw error;
    }
  },

  /**
   * Получить только учебные чаты
   */
  getGroupChats: async () => {
    try {
      const response = await api.get('/chats/chats/group_chats/');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении учебных чатов:', error);
      throw error;
    }
  },

  /**
   * Получить информацию о конкретном чате
   */
  getChatById: async (chatId) => {
    try {
      const response = await api.get(`/chats/chats/${chatId}/`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении чата ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * Создать личный чат с пользователем
   */
  createPersonalChat: async (userId) => {
    try {
      const response = await api.post('/chats/chats/create-personal/', {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании личного чата:', error);
      throw error;
    }
  },

  /**
   * Поиск пользователей для создания личного чата
   */
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search/?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
      throw error;
    }
  },

  /**
   * Получить разделы чата
   */
  getChatSections: async (chatId) => {
    try {
      const response = await api.get(`/chats/chats/${chatId}/sections/`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении разделов чата ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * Получить участников чата
   */
  getChatParticipants: async (chatId) => {
    try {
      const response = await api.get(`/chats/chats/${chatId}/`);
      return response.data.participants_info || [];
    } catch (error) {
      console.error(`Ошибка при получении участников чата ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * Получить прикрепленные курсы чата
   */
  getChatCourses: async (chatId) => {
    try {
      const response = await api.get(`/chats/chats/${chatId}/`);
      return response.data.attached_courses_info || [];
    } catch (error) {
      console.error(`Ошибка при получении курсов чата ${chatId}:`, error);
      throw error;
    }
  },

    /**
   * Получить сообщения чата
   */
  getChatMessages: async (chatId, sectionId = null) => {
    try {
      let url = `/chats/messages/chat_messages/?chat_id=${chatId}`;
      if (sectionId) {
        url += `&section_id=${sectionId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении сообщений чата ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * Отправить сообщение
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/chats/messages/', messageData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      throw error;
    }
  },
};