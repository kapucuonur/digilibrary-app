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

  const value = {
    user,
    token,
    loading,
    login,
    logout,
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