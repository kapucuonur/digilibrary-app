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
  verifyToken: () => api.get('/auth/verify'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
};

// Book services
export const bookService = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get('/books/search', { params: { q: query } }),
  getCategories: () => api.get('/books/categories'),
  addRating: (bookId, rating) => api.post(`/books/${bookId}/ratings`, rating),
  addToFavorites: (bookId) => api.post(`/books/${bookId}/favorites`),
  removeFromFavorites: (bookId) => api.delete(`/books/${bookId}/favorites`),
};

// Loan services
export const loanService = {
  borrow: (bookId) => api.post('/loans/borrow', { bookId }),
  return: (loanId) => api.post(`/loans/${loanId}/return`),
  renew: (loanId) => api.post(`/loans/${loanId}/renew`),
  getUserLoans: () => api.get('/loans/my-loans'),
  getAllLoans: (params = {}) => api.get('/loans', { params }),
};

// Admin services
export const adminService = {
  // Books
  createBook: (bookData) => api.post('/admin/books', bookData),
  updateBook: (id, bookData) => api.put(`/admin/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
  
  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  banUser: (id, duration) => api.post(`/admin/users/${id}/ban`, { duration }),
  
  // Statistics
  getStats: () => api.get('/admin/stats'),
  getReports: (params = {}) => api.get('/admin/reports', { params }),
};

export default api;