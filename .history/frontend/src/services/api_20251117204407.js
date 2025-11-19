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
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const bookService = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get('/books/search/google', { params: { q: query } }),
  getCategories: () => api.get('/categories'),
};
// Loan services
export const loanService = {
  borrow: (bookId) => api.post('/loans/borrow', { bookId }),
  return: (loanId) => api.post('/loans/return', { loanId }),
  getMyLoans: () => api.get('/loans/my-loans'),
};
export default api;