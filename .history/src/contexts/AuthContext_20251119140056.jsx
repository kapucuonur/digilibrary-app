import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

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
  
  // Token'ı localStorage'dan al
  const getToken = () => localStorage.getItem('digilibrary-token');
  const [token, setToken] = useState(getToken());

  // API instance'ı
  const API_BASE_URL = 'http://localhost:5001/api';
  
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
  });

  // Request interceptor - token'ı header'a ekle
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

  useEffect(() => {
    console.log('🔐 AuthContext mounted, token:', token);
    if (token) {
      verifyToken();
    } else {
      console.log('🔐 No token found, setting loading to false');
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      console.log('🔐 Verifying token...');
      
      // Backend'de /auth/me endpoint'i olmadığı için mock user oluştur
      const mockUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'Kullanıcı', 
        email: 'test@example.com',
        phone: '+90 555 123 4567',
        role: 'USER'
      };
      
      setUser(mockUser);
      console.log('✅ User set:', mockUser);
      
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
      console.log('🔐 Auth loading complete');
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', email);
      
      const response = await authService.login({ email, password });
      console.log('✅ Login response:', response.data);
      
      const { user, token } = response.data;
      
      // State'i güncelle
      setUser(user);
      setToken(token);
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('digilibrary-token', token);
      console.log('✅ Token saved to localStorage');
      
      toast.success('Giriş başarılı! 🎉');
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Giriş başarısız';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('digilibrary-token');
    console.log('✅ Logout complete');
    toast.info('Çıkış yapıldı');
  };

  // Profil güncelleme fonksiyonu - direkt API çağrısı
  const updateProfile = async (profileData) => {
    try {
      console.log('🔐 Updating profile:', profileData);
      
      // Direkt API çağrısı yap - endpoint backend'de yoksa mock kullan
      // const response = await api.put('/users/profile', profileData);
      
      // Şimdilik mock response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      toast.success('Profil başarıyla güncellendi!');
      return { success: true, user: updatedUser };
      
    } catch (error) {
      console.error('❌ Profile update error:', error);
      const message = error.response?.data?.message || 'Profil güncellenirken hata oluştu';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Şifre değiştirme fonksiyonu - direkt API çağrısı
  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Changing password...');
      
      // Direkt API çağrısı yap - endpoint backend'de yoksa mock kullan
      // const response = await api.put('/auth/change-password', {
      //   currentPassword,
      //   newPassword
      // });
      
      // Şimdilik mock response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (currentPassword === 'wrongpassword') {
        throw new Error('Mevcut şifre hatalı');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Yeni şifre en az 6 karakter olmalı');
      }
      
      toast.success('Şifre başarıyla değiştirildi!');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Password change error:', error);
      const message = error.response?.data?.message || error.message || 'Şifre değiştirilirken hata oluştu';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  console.log('🔐 AuthContext value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};