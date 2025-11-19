import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';
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
  
  // Token'ı localStorage'dan al
  const getToken = () => localStorage.getItem('digilibrary-token');
  const [token, setToken] = useState(getToken());

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
      
      // Backend'de /auth/me olmadığı için mock user oluştur
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

  // Profil güncelleme fonksiyonu
  const updateProfile = async (profileData) => {
    try {
      console.log('🔐 Updating profile:', profileData);
      
      // API çağrısı yap
      const response = await userService.updateProfile(profileData);
      console.log('✅ Profile update response:', response.data);
      
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

  // Şifre değiştirme fonksiyonu
  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Changing password...');
      
      // API çağrısı yap
      const response = await authService.changePassword({
        currentPassword,
        newPassword
      });
      console.log('✅ Password change response:', response.data);
      
      toast.success('Şifre başarıyla değiştirildi!');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Password change error:', error);
      const message = error.response?.data?.message || 'Şifre değiştirilirken hata oluştu';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Mock fonksiyonlar - eğer API servisleriniz yoksa bunları kullanın
  const updateProfileMock = async (profileData) => {
    try {
      console.log('🔐 Mock profile update:', profileData);
      
      // Simüle API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kullanıcı bilgilerini güncelle
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      toast.success('Profil başarıyla güncellendi!');
      return { success: true, user: updatedUser };
      
    } catch (error) {
      console.error('❌ Mock profile update error:', error);
      toast.error('Profil güncellenirken hata oluştu');
      throw error;
    }
  };

  const changePasswordMock = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Mock password change...');
      
      // Simüle API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Şifre kontrolü (mock)
      if (currentPassword === 'wrongpassword') {
        throw new Error('Mevcut şifre hatalı');
      }
      
      toast.success('Şifre başarıyla değiştirildi!');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Mock password change error:', error);
      toast.error(error.message || 'Şifre değiştirilirken hata oluştu');
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile: updateProfileMock, // Mock fonksiyonu kullanıyoruz
    changePassword: changePasswordMock, // Mock fonksiyonu kullanıyoruz
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