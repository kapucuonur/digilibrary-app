import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Clock, Star, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - backend bağlantısı olmadan
  const stats = {
    currentlyReading: 2,
    dueSoon: 1,
    favorites: 5,
    overdue: 0
  };

  const recentActivity = [
    { id: 1, book: 'Sefiller', action: 'Ödünç Alındı', date: '2024-01-15' },
    { id: 2, book: 'Suç ve Ceza', action: 'İade Edildi', date: '2024-01-10' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hoş Geldiniz, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Okuma istatistikleriniz ve son aktiviteleriniz
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Şu Anda Okunuyor</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentlyReading}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yakında Teslim</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dueSoon}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favoriler</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.favorites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gecikmiş</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Son Aktivite
          </h2>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.book}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;