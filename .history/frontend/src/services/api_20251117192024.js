import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Book services
export const bookService = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get('/books/search', { params: { q: query } }),
  getCategories: () => api.get('/books/categories'),
};

// Loan services (şimdilik mock)
export const loanService = {
  borrow: (bookId) => api.post('/loans/borrow', { bookId }),
  return: (loanId) => api.post(`/loans/${loanId}/return`),
  renew: (loanId) => api.post(`/loans/${loanId}/renew`),
  getUserLoans: () => api.get('/loans/my-loans'),
};

// Admin services (şimdilik mock)
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
};

export default api;