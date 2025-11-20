import axios from 'axios';

// NETLIFY FUNCTIONS BASE URL - TEK LİNK!
const API_BASE_URL = '';

const api = axios.create({
  timeout: 10000,
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

// Auth services
export const authService = {
  login: (credentials) => api.post('/.netlify/functions/auth/login', credentials),
  register: (userData) => api.post('/.netlify/functions/auth/register', userData),
  getCurrentUser: () => api.get('/.netlify/functions/auth/me'),
  changePassword: (passwordData) => api.put('/.netlify/functions/auth/change-password', passwordData),
};

// User services
export const userService = {
  updateProfile: (profileData) => api.put('/.netlify/functions/auth/profile', profileData),
  getProfile: () => api.get('/.netlify/functions/auth/profile'),
};

// Book services - GOOGLE BOOKS API
export const bookService = {
  getAll: () => api.get('/.netlify/functions/books'),
  getById: (id) => api.get(`/.netlify/functions/books/${id}`),
  search: (query) => api.get(`/.netlify/functions/books?q=${query}`),
  getCategories: () => Promise.resolve({ data: ['Fiction', 'Science', 'Technology', 'History', 'Biography'] }),
};

// Loan services - BORROW FUNCTION
export const loanService = {
  borrow: (bookId) => {
    console.log('🚀 Sending borrow request for book:', bookId);
    return api.post('/.netlify/functions/borrow', { bookId });
  },
  return: (loanId) => api.post('/.netlify/functions/loans/return', { loanId }),
  getMyLoans: () => api.get('/.netlify/functions/loans/my-loans'),
};

export default api;