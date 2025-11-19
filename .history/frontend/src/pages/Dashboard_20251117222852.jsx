import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loanService } from '../services/api';
import { BookOpen, Clock, Star, AlertCircle, Book, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await loanService.getMyLoans();
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Ödünç alınan kitaplar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    try {
      await loanService.return(loanId);
      loadLoans(); // Listeyi yenile
    } catch (error) {
      console.error('İade hatası:', error);
    }
  };

  // İstatistikler
  const stats = {
    currentlyReading: loans.length,
    dueSoon: loans.filter(loan => {
      const dueDate = new Date(loan.dueDate);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays > 0;
    }).length,
    favorites: 0,
    overdue: loans.filter(loan => new Date(loan.dueDate) < new Date()).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hoş Geldiniz, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Okuma istatistikleriniz ve ödünç aldığınız kitaplar
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

        {/* Ödünç Alınan Kitaplar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ödünç Aldığınız Kitaplar
          </h2>
          
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Henüz ödünç aldığınız kitap yok</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Kitaplar sayfasından kitap ödünç alabilirsiniz
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map(loan => {
                const dueDate = new Date(loan.dueDate);
                const today = new Date();
                const isOverdue = dueDate < today;
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={loan.bookCover || '/images/default-book-cover.jpg'}
                        alt={loan.bookTitle}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {loan.bookTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {loan.bookAuthor}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Teslim: {dueDate.toLocaleDateString('tr-TR')}</span>
                          </div>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Gecikmiş
                            </span>
                          )}
                          {!isOverdue && daysUntilDue <= 3 && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Yakında teslim
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleReturn(loan.id)}
                      className="btn-outline text-sm"
                    >
                      İade Et
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;