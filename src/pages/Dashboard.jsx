import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext'; // 👈 BU EKLENDİ
import { loanService } from '../services/api';
import PaymentModal from '../components/PaymentModal'; // Added PaymentModal
import { BookOpen, Clock, Star, AlertCircle, Book, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage(); // 👈 BU EKLENDİ
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAYMENT STATE
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await loanService.getMyLoans();
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Failed to load borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
  try {
    console.log('🔄 Returning book, loanId:', loanId);
    
    await loanService.return(loanId);
    
    // Başarı mesajı göster
    const message = language === 'tr' 
      ? 'Kitap başarıyla iade edildi!' 
      : 'Book returned successfully!';
    alert(message);
    
    loadLoans(); // Listeyi yenile
    
  } catch (error) {
    console.error('Return error:', error);
    
    const errorMessage = language === 'tr'
      ? 'İade işlemi başarısız: ' + (error.response?.data?.error || error.message)
      : 'Return failed: ' + (error.response?.data?.error || error.message);
    
    alert(errorMessage);
  }
};

  // Statistics
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

  // Ceza hesapla – Profile.jsx ile aynı mantık
  const calculateFine = (loan) => {
    try {
      if (!loan?.dueDate) return { fineDays: 0, fineAmount: 0, currency: 'TRY', symbol: '₺' };

      const today = new Date();
      const dueDate = new Date(loan.dueDate);
      if (isNaN(dueDate.getTime())) return { fineDays: 0, fineAmount: 0, currency: 'TRY', symbol: '₺' };

      const fineDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));

      // Kullanıcının dili ne? → Euro mu TL mi?
      const isEuro = language !== 'tr';
      const dailyFine = isEuro ? 0.50 : 5.00; // 0.50€ veya 5₺
      const fineAmount = Math.round(fineDays * dailyFine * 100) / 100;

      return {
        fineDays,
        fineAmount,
        currency: isEuro ? 'EUR' : 'TRY',
        symbol: isEuro ? '€' : '₺'
      };
    } catch (error) {
      console.error('calculateFine error:', error);
      return { fineDays: 0, fineAmount: 0, currency: 'TRY', symbol: '₺' };
    }
  };

  // Dil'e göre metinler
  const getTexts = () => {
    if (language === 'tr') {
      return {
        welcome: 'Hoş Geldiniz',
        subtitle: 'Okuma istatistikleriniz ve ödünç aldığınız kitaplar',
        currentlyReading: 'Şu Anda Okunuyor',
        dueSoon: 'Yakında Teslim',
        favorites: 'Favoriler',
        overdue: 'Gecikmiş',
        borrowedBooks: 'Ödünç Aldığınız Kitaplar',
        noBooks: 'Henüz ödünç aldığınız kitap yok',
        noBooksDesc: 'Kitaplar sayfasından kitap ödünç alabilirsiniz',
        returnBook: 'İade Et',
        dueDate: 'Teslim',
        overdueText: 'Gecikmiş',
        dueSoonText: 'Yakında teslim',
        dueSoonText: 'Yakında teslim',
        loading: 'Yükleniyor...',
        payFine: 'Ceza Öde'
      };
    } else {
      return {
        welcome: 'Welcome',
        subtitle: 'Your reading statistics and borrowed books',
        currentlyReading: 'Currently Reading',
        dueSoon: 'Due Soon',
        favorites: 'Favorites',
        overdue: 'Overdue',
        borrowedBooks: 'Your Borrowed Books',
        noBooks: 'You have no borrowed books yet',
        noBooksDesc: 'You can borrow books from the books page',
        returnBook: 'Return',
        dueDate: 'Due',
        overdueText: 'Overdue',
        dueSoonText: 'Due Soon',
        dueSoonText: 'Due Soon',
        loading: 'Loading...',
        payFine: 'Pay Fine'
      };
    }
  };

  const texts = getTexts();

  // Tarih formatlama
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');
    } catch (error) {
      return dateString;
    }
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
          {texts.welcome}, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {texts.subtitle}
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {texts.currentlyReading}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.currentlyReading}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {texts.dueSoon}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.dueSoon}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {texts.favorites}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.favorites}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {texts.overdue}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.overdue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowed Books */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {texts.borrowedBooks}
          </h2>
          
          {loans.length === 0 ? (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {texts.noBooks}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {texts.noBooksDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map(loan => {
                const dueDate = new Date(loan.dueDate);
                const today = new Date();
                const isOverdue = dueDate < today;
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                const fineInfo = calculateFine(loan);

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
                            <span>
                              {texts.dueDate}: {formatDate(loan.dueDate)}
                            </span>
                          </div>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {texts.overdueText}
                            </span>
                          )}
                          {!isOverdue && daysUntilDue <= 3 && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {texts.dueSoonText}
                            </span>
                          )}
                          {/* Ceza Bilgisi */}
                          {fineInfo.fineDays > 0 && !loan.finePaid && (
                             <span className="text-xs font-bold text-red-600">
                               {fineInfo.fineAmount.toFixed(2)} {fineInfo.symbol}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       {/* CEZA ÖDE BUTONU */}
                       {fineInfo.fineDays > 0 && !loan.finePaid && (
                        <button 
                          onClick={() => {
                            setSelectedLoan({
                              ...loan,
                              fineDays: fineInfo.fineDays,
                              fineAmount: fineInfo.fineAmount,
                              fineCurrency: fineInfo.currency
                            });
                            setShowPayment(true);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                          {texts.payFine}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReturn(loan.id)}
                        className="btn-outline text-sm"
                      >
                        {texts.returnBook}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal 
        loan={selectedLoan}
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          loadLoans(); // Listeyi yenile
          // Başarı mesajı
          const msg = language === 'tr' ? 'Ödeme başarılı!' : 'Payment successful!';
          alert(msg);
        }}
      />
    </div>
  );
};

export default Dashboard;