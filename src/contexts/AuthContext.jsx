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
  const [token, setToken] = useState(() => localStorage.getItem('digilibrary-token'));
  const navigate = useNavigate();
  useEffect(() => {
    console.log('🔐 AuthContext mounted, token:', token);
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      console.log('🔐 Verifying token...');
      const response = await authService.getCurrentUser();
      setUser(response.data);
      console.log('✅ User verified:', response.data);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt:', email);
      const response = await authService.login({ email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('digilibrary-token', token);
      
      toast.success('Giriş başarılı! 🎉');
      navigate('/dashboard');
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error.response?.data?.message || 'Giriş başarısız';
      toast.error(message);
      return { success: false, message };
    }
  };

  // 👇 BU register FONKSİYONUNU EKLEYİN
  const register = async (userData) => {
    try {
      console.log('🔐 Register attempt:', userData);
      const response = await authService.register(userData);
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('digilibrary-token', token);
      
      toast.success('Kayıt başarılı! 🎉');
       

      navigate('/dashboard');
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      const message = error.response?.data?.message || 'Kayıt işlemi başarısız';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('digilibrary-token');
    toast.info('Çıkış yapıldı');
    navigate('/');
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('🔐 Updating profile:', profileData);
      // Bu fonksiyon için backend endpoint'i eklemeniz gerekebilir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Changing password...');
      // Bu fonksiyon için backend endpoint'i eklemeniz gerekebilir
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};