import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('digilibrary-token'));

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      // Backend'de /auth/me endpoint'i olmadığı için mock user kullan
      const mockUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'Kullanıcı',
        email: 'test@example.com',
        role: 'USER'
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      // Token'ı localStorage'a kaydet
      localStorage.setItem('digilibrary-token', token);
      
      toast.success('Giriş başarılı!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş başarısız';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('digilibrary-token', token);
      
      toast.success('Kayıt başarılı!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Kayıt başarısız';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('digilibrary-token');
    toast.info('Çıkış yapıldı');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};