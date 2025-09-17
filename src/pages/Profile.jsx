import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit3, Key, Calendar, BookOpen, X, Save, Clock, ArrowRight } from 'lucide-react';
import { loanService } from '../services/api';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';

const Profile = () => {
  console.log('🎯 PROFILE COMPONENT RENDERED!');
  
  const { user, updateProfile, changePassword } = useAuth();
  const { t, language } = useLanguage();
  
  // STATE'LER
  const [userLoans, setUserLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // PAYMENT STATE'LERİ
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  
  // FORM STATE'LERİ
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ÖDÜNÇ KİTAPLARI YÜKLE
  
  
  useEffect(() => {
  console.log('🔥 PROFILE USEFFECT FIRED!');
  
  const loadUserLoans = async () => {
    try {
      console.log('🔄 Loading user loans...');
      setLoansLoading(true);
      
      const response = await loanService.getMyLoans();
      console.log('✅ Loans API Response:', response);
      
      if (response?.data?.success && Array.isArray(response.data.data)) {
        console.log('🎉 Loans loaded:', response.data.data.length);
        setUserLoans(response.data.data);
      } else {
        console.log('⚠️ No loans data');
        setUserLoans([]);
      }
    } catch (error) {
      console.error('❌ Error loading loans:', error);
      setUserLoans([]);
    } finally {
      setLoansLoading(false);
    }
  };

  loadUserLoans();
}, [refreshCounter]);

   // Ceza hesapla – TL / EUR otomatik, dil bazlı
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
  const handleManualRefresh = () => {
    console.log('🔄 MANUAL REFRESH TRIGGERED');
    setRefreshCounter(prev => prev + 1);
  };

  // Mock user data
  const userData = {
    firstName: user?.firstName || 'Test',
    lastName: user?.lastName || 'Kullanıcı',
    email: user?.email || 'test@example.com',
    phone: user?.phone || '+90 555 123 4567',
    joinDate: '2024-01-01',
    totalBooks: 15,
    currentlyReading: userLoans.length
  };

  // Profil düzenleme işlevi
  const handleEditProfile = () => {
    setFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  // Şifre değiştirme işlevi
  const handleChangePassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(true);
    setError('');
    setSuccess('');
  };

  // Form input değişiklikleri
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Şifre input değişiklikleri
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Profil güncelleme
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess(language === 'tr' ? 'Profil başarıyla güncellendi!' : 'Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.message || (language === 'tr' ? 'Profil güncellenirken hata oluştu' : 'Error updating profile'));
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştirme
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(language === 'tr' ? 'Yeni şifreler eşleşmiyor' : 'New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError(language === 'tr' ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess(language === 'tr' ? 'Şifre başarıyla değiştirildi!' : 'Password changed successfully!');
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.message || (language === 'tr' ? 'Şifre değiştirilirken hata oluştu' : 'Error changing password'));
    } finally {
      setLoading(false);
    }
  };

  // Dil'e göre metinler
  const getTexts = () => {
    if (language === 'tr') {
      return {
        title: 'Profilim',
        personalInfo: 'Kişisel Bilgiler',
        readingStats: 'Okuma İstatistikleri',
        accountInfo: 'Hesap Bilgileri',
        myLoans: 'Ödünç Aldığım Kitaplar',
        firstName: 'Ad',
        lastName: 'Soyad',
        email: 'Email',
        phone: 'Telefon',
        totalRead: 'Toplam Okunan',
        currentlyReading: 'Şu Anda Okunuyor',
        activeLoans: 'Aktif Ödünç',
        membershipDate: 'Üyelik Tarihi',
        accountType: 'Hesap Türü',
        standardUser: 'Standart Kullanıcı',
        editProfile: 'Profili Düzenle',
        changePassword: 'Şifre Değiştir',
        editProfileDesc: 'Kişisel bilgilerinizi güncelleyin',
        changePasswordDesc: 'Hesap güvenliğiniz için şifrenizi değiştirin',
        currentPassword: 'Mevcut Şifre',
        newPassword: 'Yeni Şifre',
        confirmPassword: 'Yeni Şifre Tekrar',
        save: 'Kaydet',
        cancel: 'İptal',
        updateProfile: 'Profili Güncelle',
        changePasswordTitle: 'Şifre Değiştir',
        noLoans: 'Henüz ödünç aldığınız kitap yok',
        borrowedDate: 'Alınma Tarihi',
        dueDate: 'Son Teslim Tarihi',
        viewDetails: 'Detayları Gör',
        refresh: 'Yenile',
        payFine: 'Ceza Öde',
        daysOverdue: 'gün gecikme',
        totalFine: 'Toplam ceza'
      };
    } else {
      return {
        title: 'My Profile',
        personalInfo: 'Personal Information',
        readingStats: 'Reading Statistics',
        accountInfo: 'Account Information',
        myLoans: 'My Borrowed Books',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        totalRead: 'Total Read',
        currentlyReading: 'Currently Reading',
        activeLoans: 'Active Loans',
        membershipDate: 'Membership Date',
        accountType: 'Account Type',
        standardUser: 'Standard User',
        editProfile: 'Edit Profile',
        changePassword: 'Change Password',
        editProfileDesc: 'Update your personal information',
        changePasswordDesc: 'Change your password for account security',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        save: 'Save',
        cancel: 'Cancel',
        updateProfile: 'Update Profile',
        changePasswordTitle: 'Change Password',
        noLoans: 'You have no borrowed books yet',
        borrowedDate: 'Borrowed Date',
        dueDate: 'Due Date',
        viewDetails: 'View Details',
        refresh: 'Refresh',
        payFine: 'Pay Fine',
        daysOverdue: 'days overdue',
        totalFine: 'Total fine'
      };
    }
  };

  const texts = getTexts();

  // Tarih formatlama fonksiyonunu güvenli hale getir
const formatDate = (dateString) => {
  try {
    console.log('📅 formatDate input:', dateString, 'type:', typeof dateString);
    
    if (!dateString) {
      console.warn('⚠️ formatDate: dateString yok');
      return 'Tarih yok';
    }
    
    // String'e çevir
    const dateStr = String(dateString);
    
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      console.warn('⚠️ formatDate: geçersiz tarih', dateStr);
      return 'Geçersiz tarih';
    }
    
    const formatted = date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');
    return formatted;
    
  } catch (error) {
    console.error('❌ formatDate hatası:', error, dateString);
    return 'Tarih hatası';
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {texts.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'tr' 
                ? 'Hesap bilgilerinizi ve okuma istatistiklerinizi görüntüleyin'
                : 'View your account information and reading statistics'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sol Taraf - Kişisel Bilgiler */}
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  {texts.personalInfo}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="form-label">{texts.firstName}</label>
                    <p className="text-gray-900 dark:text-white font-medium">{userData.firstName}</p>
                  </div>
                  <div>
                    <label className="form-label">{texts.lastName}</label>
                    <p className="text-gray-900 dark:text-white font-medium">{userData.lastName}</p>
                  </div>
                  <div>
                    <label className="form-label">{texts.email}</label>
                    <p className="text-gray-900 dark:text-white font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <label className="form-label">{texts.phone}</label>
                    <p className="text-gray-900 dark:text-white font-medium">{userData.phone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleEditProfile}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {texts.editProfile}
                  </button>
                  <button 
                    onClick={handleChangePassword}
                    className="btn-outline flex items-center justify-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {texts.changePassword}
                  </button>
                </div>
              </div>

              {/* Reading Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {texts.readingStats}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userData.totalBooks}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {texts.totalRead}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {userData.currentlyReading}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {texts.currentlyReading}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Ödünç Kitaplar ve Hesap Bilgileri */}
            <div className="space-y-8">
              {/* Ödünç Alınan Kitaplar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    {texts.myLoans} 
                    <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {userLoans.length}
                    </span>
                  </h2>
                  <button 
                    onClick={handleManualRefresh}
                    className="btn-outline text-sm flex items-center gap-1"
                    disabled={loansLoading}
                  >
                    🔄 {texts.refresh}
                  </button>
                </div>

                {loansLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {language === 'tr' ? 'Ödünç kitaplar yükleniyor...' : 'Loading borrowed books...'}
                    </p>
                  </div>
                ) : userLoans.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {texts.noLoans}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'tr' 
                        ? 'Kitaplar sayfasından kitap ödünç alabilirsiniz.' 
                        : 'You can borrow books from the books page.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    
{userLoans.map((loan) => {
  const fineInfo = calculateFine(loan);
  
  return (
    <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
      
      {/* Kitap Resmi ve Bilgileri */}
      <div className="flex items-center space-x-4 flex-1">
        <img
          src={loan.bookCover}
          alt={loan.bookTitle}
          className="w-12 h-16 object-cover rounded border"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDEyOCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxOTIiIGZpbGw9IiM0RjQ2RTUiLz48dGV4dCB4PSI2NCIgeT0iOTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPktpdGFwPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {loan.bookTitle}
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            <div>Alınma: {formatDate(loan.borrowDate)}</div>
            <div>Son Tarih: {formatDate(loan.dueDate)}</div>
          </div>
        </div>
      </div>
      
      {/* Ceza Durumu + Öde Butonu */}
      <div className="flex flex-col items-end gap-3">

        {/* Ceza Durumu */}
      {fineInfo.fineDays > 0 && (
        <div className="text-right">
          {loan.finePaid ? (
            <div className="flex items-center gap-2 justify-end text-green-600 font-bold">
              <span className="text-2xl">Paid</span>
            </div>
          ) : (
            <>
              <div className="text-yellow-600 font-semibold">
                {fineInfo.fineDays} {language === 'tr' ? 'gün gecikme' : 'days overdue'}
              </div>
              <div className="text-yellow-700 font-bold text-lg">
                {fineInfo.fineAmount.toFixed(2)} {fineInfo.symbol}
              </div>
            </>
          )}
        </div>
      )}

      {/* ÖDE BUTONU */}
      <div className="flex gap-3 items-center">
        {fineInfo.fineDays > 0 && !loan.finePaid && (
          <button 
            onClick={() => {
              setSelectedLoan({
                ...loan,
                fineDays: fineInfo.fineDays,
                fineAmount: fineInfo.fineAmount,
                fineCurrency: fineInfo.currency // ← Stripe'a doğru currency gider!
              });
              setShowPayment(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md"
          >
            {language === 'tr' ? 'Öde' : 'Pay'}
          </button>
        )}

{/* DETAY BUTONU – ARTIK %100 ÇALIŞIYOR */}
<button 
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    // calculateFine artık { fineDays, fineAmount, symbol } döndüğü için fineInfo kullanıyoruz
    const fineInfo = calculateFine(loan);

    toast.info(
      <div className="text-left space-y-2">
        <div className="font-bold text-blue-900 text-lg">{loan.bookTitle}</div>
        <div className="text-sm space-y-1">
          <div><strong>{language === 'tr' ? 'Alınma' : 'Borrowed'}:</strong> {formatDate(loan.borrowDate)}</div>
          <div><strong>{language === 'tr' ? 'Son Tarih' : 'Due Date'}:</strong> {formatDate(loan.dueDate)}</div>
          <div><strong>{language === 'tr' ? 'Gecikme' : 'Overdue'}:</strong> {fineInfo.fineDays} {language === 'tr' ? 'gün' : 'days'}</div>
          
          {/* DOĞRU CEZA GÖSTERİMİ – TL/EUR OTOMATİK */}
          <div>
            <strong>{language === 'tr' ? 'Ceza' : 'Fine'}:</strong>{' '}
            {fineInfo.fineDays > 0 
              ? `${fineInfo.fineAmount.toFixed(2)} ${fineInfo.symbol}`
              : (language === 'tr' ? 'Yok' : 'None')
            }
          </div>

          {/* ÖDEME DURUMU */}
          <div className={loan.finePaid ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            → {loan.finePaid 
              ? (language === 'tr' ? 'Ödendi' : 'Paid') 
              : (language === 'tr' ? 'Ödenmedi' : 'Not Paid')
            }
          </div>
        </div>
      </div>,
      { 
        autoClose: 8000,
        className: 'text-sm'
      }
    );
  }}
  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-sm font-medium transition-all shadow-sm"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  {language === 'tr' ? 'Detay' : 'Detail'}
</button>
</div>
      </div>
    </div>
  );
})}
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {texts.accountInfo}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{texts.membershipDate}:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{userData.joinDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{texts.accountType}:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{texts.standardUser}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">{texts.activeLoans}:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{userLoans.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{texts.updateProfile}</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmitProfile}>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">{texts.firstName}</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">{texts.lastName}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">{texts.phone}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-outline flex-1"
                    disabled={loading}
                  >
                    {texts.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center justify-center gap-2 flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      '...'
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {texts.save}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{texts.changePasswordTitle}</h3>
                <button 
                  onClick={() => setIsChangingPassword(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmitPassword}>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">{texts.currentPassword}</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">{texts.newPassword}</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="form-label">{texts.confirmPassword}</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="btn-outline flex-1"
                    disabled={loading}
                  >
                    {texts.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center justify-center gap-2 flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      '...'
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {texts.save}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

{/* Payment Modal */}
<PaymentModal 
  loan={selectedLoan}
  isOpen={showPayment}
  onClose={() => setShowPayment(false)}
  onSuccess={() => {
    console.log('Ödeme başarılı, ceza kapatılıyor:', selectedLoan?.id);

    
    setUserLoans(prevLoans => 
      prevLoans.map(loan => 
        loan.id === selectedLoan?.id 
          ? { 
              ...loan, 
              finePaid: true, 
              fineAmount: 0,
              paidAt: new Date().toISOString(),
              paymentStatus: 'paid'
            } 
          : loan
      )
    );

    toast.success(
      language === 'tr' 
        ? 'Ceza başarıyla ödendi ve kapatıldı!' 
        : 'Fine paid and closed successfully!'
    );

    setShowPayment(false);
  }}
/>
      </div>
    </div>
  );
};

export default Profile;