// services/api.js - bu fonksiyonları ekleyin
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('digilibrary-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// User servislerini ekleyin
export const userService = {
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getProfile: () => api.get('/users/profile'),
};

export const bookService = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get('/books/search/google', { params: { q: query, maxResult:50 } }),
  getCategories: () => api.get('/categories'),
};

// Loan services
export const loanService = {
  borrow: (bookId) => api.post('/loans/borrow', { bookId }),
  return: (loanId) => api.post('/loans/return', { loanId }),
  getMyLoans: () => api.get('/loans/my-loans'),
};

export default api;