import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [token, setToken] = useState(null); // localStorage'dan OKUMA, sadece state'te tut
  const navigate = useNavigate();

  // Token'ı sadece mount anında oku, sonra state yönetir
  useEffect(() => {
    const savedToken = localStorage.getItem('digilibrary-token');
    const tokenTime = localStorage.getItem('digilibrary-token-time');
    const now = Date.now();

    // Token yoksa veya 30 günden eskiyse temizle
    if (!savedToken || !tokenTime || (now - tokenTime > 30 * 24 * 60 * 60 * 1000)) {
      logout();
      setLoading(false);
      return;
    }

    setToken(savedToken);
    verifyToken(savedToken);
  }, []);

  const verifyToken = async (currentToken) => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Token geçersiz veya süresi dolmuş', error);
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
      localStorage.setItem('digilibrary-token', token);
      localStorage.setItem('digilibrary-token-time', Date.now());

      toast.success('Giriş başarılı! Hoş geldin 👋');
      navigate('/dashboard');
      return { success: true, user };
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
      localStorage.setItem('digilibrary-token-time', Date.now());

      toast.success('Kayıt başarılı! Hoş geldin 🎉');
      navigate('/dashboard');
      return { success: true, user };
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
    localStorage.removeItem('digilibrary-token-time');
    toast.info('Çıkış yapıldı 👋');
    navigate('/login');
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
      {!loading && children}
    </AuthContext.Provider>
  );
};