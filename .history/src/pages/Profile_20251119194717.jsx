import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit3, Key, Calendar, BookOpen, X, Save, Clock, ArrowRight } from 'lucide-react';
import { loanService } from '../services/api';

const Profile = () => {
  console.log('🎯 PROFILE COMPONENT RENDERED!'); // Bu satır çalışıyor mu?
  
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

  // Profile component'ine ekle
const [refreshCounter, setRefreshCounter] = useState(0);

const handleManualRefresh = () => {
  console.log('🔄 MANUAL REFRESH TRIGGERED');
  setRefreshCounter(prev => prev + 1);
};

// Dashboard component'inde
useEffect(() => {
  console.log('🔥 DASHBOARD USEFFECT FIRED!');
  
  const loadUserLoans = async () => {
    try {
      console.log('🔄 Starting to load user loans...');
      setLoansLoading(true);
      
      const response = await loanService.getMyLoans();
      console.log('✅ Loans API Response:', response);
      
      if (response.data && response.data.success) {
        console.log('🎉 Loans found:', response.data.data.length, 'items');
        setUserLoans(response.data.data);
      } else {
        console.log('⚠️ No loans data in response, using empty array');
        setUserLoans([]);
      }
    } catch (error) {
      console.error('❌ Error loading loans:', error);
      // Hata durumunda bile boş array set et
      setUserLoans([]);
      
      // Kullanıcıya bilgi ver
      toast.error('Kitaplar yüklenirken geçici bir sorun oluştu');
    } finally {
      setLoansLoading(false);
      console.log('🏁 Loans loading finished');
    }
  };

  loadUserLoans();
}, []);

// JSX'e refresh butonu ekle
<button 
  onClick={handleManualRefresh}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  🔄 Loans'ı Yenile
</button>

  // Mock user data - loans sayısını güncelle
  const userData = {
    firstName: user?.firstName || 'Test',
    lastName: user?.lastName || 'Kullanıcı',
    email: user?.email || 'test@example.com',
    phone: user?.phone || '+90 555 123 4567',
    joinDate: '2024-01-01',
    totalBooks: 15,
    currentlyReading: userLoans.length // 🔥 ÖNEMLİ: loans sayısını kullan
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

    // Şifre kontrolü
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
        viewDetails: 'Detayları Gör'
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
        viewDetails: 'View Details'
      };
    }
  };

  const texts = getTexts();

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        {/* DEBUG MESSAGE */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <strong>Debug:</strong> Profile component rendered. Loans: {userLoans.length}
        </div>
        
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
              {/* Ödünç Alınan Kitaplar */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
    <BookOpen className="h-5 w-5 mr-2" />
    {texts.myLoans} 
    <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
      {userLoans.length}
    </span>
  </h2>

  {/* DEBUG INFO */}
  <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
    <div>Loans Loading: {loansLoading ? 'YES' : 'NO'}</div>
    <div>Loans Count: {userLoans.length}</div>
    <div>User: {user?.firstName} {user?.lastName}</div>
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
      {userLoans.map((loan) => (
        <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
          <div className="flex items-center space-x-4 flex-1">
            <img
              src={loan.bookCover || '/images/default-book-cover.jpg'}
              alt={loan.bookTitle}
              className="w-12 h-16 object-cover rounded border"
              onError={(e) => {
                e.target.src = '/images/default-book-cover.jpg';
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {loan.bookTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{texts.borrowedDate}: {loan.borrowedDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{texts.dueDate}: {loan.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="btn-outline text-xs flex items-center gap-1 whitespace-nowrap">
            {texts.viewDetails}
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ))}
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
      </div>
    </div>
  );
};

export default Profile;