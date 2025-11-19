import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🔐 Navbar - Auth state:', { user, isAuthenticated, loading });

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div>Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DigiLibrary</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}>
              Ana Sayfa
            </Link>
            <Link to="/books" className={`nav-link ${location.pathname === '/books' ? 'nav-link-active' : ''}`}>
              Kitaplar
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="btn-outline text-sm"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;