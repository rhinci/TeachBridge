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
   * Создать новый раздел в чате
   */
  createChatSection: async (chatId, sectionData) => {
    try {
      const response = await api.post(`/chats/chats/${chatId}/create_section/`, sectionData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при создании раздела в чате ${chatId}:`, error);
      throw error;
    }
  },

  /**
   * Обновить раздел чата
   */
  updateChatSection: async (sectionId, sectionData) => {
    try {
      const response = await api.put(`/chats/chat-sections/${sectionId}/`, sectionData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении раздела ${sectionId}:`, error);
      throw error;
    }
  },

  /**
   * Удалить раздел чата
   */
  deleteChatSection: async (sectionId) => {
    try {
      const response = await api.delete(`/chats/chat-sections/${sectionId}/`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении раздела ${sectionId}:`, error);
      throw error;
    }
  },
  /**
   * Получить только учебные чаты
   */
   getGroupChats: async () => {
    try {
      console.log('=== Debug: Calling /chats/chats/group_chats/ ===');
      
      const response = await api.get('/chats/chats/group_chats/');
      
      console.log('=== Debug: API Response ===');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      
      // Проверяем структуру ответа
      if (response.data && typeof response.data === 'object') {
        // Проверяем разные возможные структуры
        if (Array.isArray(response.data)) {
          console.log('Data is array, length:', response.data.length);
          if (response.data.length > 0) {
            console.log('First chat sample:', response.data[0]);
          }
          return response.data;
        } else if (response.data.results) {
          console.log('Data has .results property, length:', response.data.results.length);
          return response.data.results;
        } else if (response.data.data) {
          console.log('Data has .data property');
          return response.data.data;
        }
      }
      
      console.error('Unexpected response structure:', response.data);
      return [];
      
    } catch (error) {
      console.error('=== Debug: API Error ===');
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 404) {
        console.error('Endpoint not found! Check backend URL');
      }
      
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