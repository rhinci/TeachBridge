import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // измени порт, если будешь использовать другой

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;