import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Test fonksiyonu
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Backend bağlantısı başarılı:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend bağlantı hatası:', error);
    return false;
  }
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const bookService = {
  getAll: () => api.get('/books'),
};

export default api;