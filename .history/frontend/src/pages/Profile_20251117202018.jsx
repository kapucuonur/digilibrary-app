import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  // Mock user data
  const userData = {
    firstName: user?.firstName || 'Test',
    lastName: user?.lastName || 'Kullanıcı',
    email: user?.email || 'test@example.com',
    phone: '+90 555 123 4567',
    joinDate: '2024-01-01',
    totalBooks: 15,
    currentlyReading: 2
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Profilim
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Kişisel Bilgiler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Ad</label>
                  <p className="text-gray-900 dark:text-white">{userData.firstName}</p>
                </div>
                <div>
                  <label className="form-label">Soyad</label>
                  <p className="text-gray-900 dark:text-white">{userData.lastName}</p>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <p className="text-gray-900 dark:text-white">{userData.email}</p>
                </div>
                <div>
                  <label className="form-label">Telefon</label>
                  <p className="text-gray-900 dark:text-white">{userData.phone}</p>
                </div>
              </div>
            </div>

            {/* Reading Statistics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Okuma İstatistikleri
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userData.totalBooks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Okunan</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userData.currentlyReading}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Şu Anda Okunuyor</div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Hesap Bilgileri
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Üyelik Tarihi:</span>
                  <span className="text-gray-900 dark:text-white">{userData.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hesap Türü:</span>
                  <span className="text-gray-900 dark:text-white">Standart Kullanıcı</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="btn-primary">
                Profili Düzenle
              </button>
              <button className="btn-outline">
                Şifre Değiştir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;