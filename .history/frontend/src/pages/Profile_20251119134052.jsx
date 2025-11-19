import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit3, Key, Calendar, BookOpen } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  // Profil düzenleme işlevi
  const handleEditProfile = () => {
    setIsEditing(true);
    // Burada profil düzenleme modal'ı açılabilir veya form gösterilebilir
    console.log('Profil düzenleme açıldı');
  };

  // Şifre değiştirme işlevi
  const handleChangePassword = () => {
    setIsChangingPassword(true);
    // Burada şifre değiştirme modal'ı açılabilir
    console.log('Şifre değiştirme açıldı');
  };

  // Dil'e göre metinler
  const getTexts = () => {
    if (language === 'tr') {
      return {
        title: 'Profilim',
        personalInfo: 'Kişisel Bilgiler',
        readingStats: 'Okuma İstatistikleri',
        accountInfo: 'Hesap Bilgileri',
        firstName: 'Ad',
        lastName: 'Soyad',
        email: 'Email',
        phone: 'Telefon',
        totalRead: 'Toplam Okunan',
        currentlyReading: 'Şu Anda Okunuyor',
        membershipDate: 'Üyelik Tarihi',
        accountType: 'Hesap Türü',
        standardUser: 'Standart Kullanıcı',
        editProfile: 'Profili Düzenle',
        changePassword: 'Şifre Değiştir',
        editProfileDesc: 'Kişisel bilgilerinizi güncelleyin',
        changePasswordDesc: 'Hesap güvenliğiniz için şifrenizi değiştirin'
      };
    } else {
      return {
        title: 'My Profile',
        personalInfo: 'Personal Information',
        readingStats: 'Reading Statistics',
        accountInfo: 'Account Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        totalRead: 'Total Read',
        currentlyReading: 'Currently Reading',
        membershipDate: 'Membership Date',
        accountType: 'Account Type',
        standardUser: 'Standard User',
        editProfile: 'Edit Profile',
        changePassword: 'Change Password',
        editProfileDesc: 'Update your personal information',
        changePasswordDesc: 'Change your password for account security'
      };
    }
  };

  const texts = getTexts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
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
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                {texts.personalInfo}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Reading Statistics */}
            <div className="mb-8">
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

            {/* Account Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {texts.accountInfo}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{texts.membershipDate}:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{userData.joinDate}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">{texts.accountType}:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{texts.standardUser}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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

            {/* Action Descriptions */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="text-center sm:text-left">
                {texts.editProfileDesc}
              </div>
              <div className="text-center sm:text-right">
                {texts.changePasswordDesc}
              </div>
            </div>
          </div>

          {/* Edit Profile Modal (Örnek - gerçek uygulamada state yönetimi gerekli) */}
          {isEditing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">{texts.editProfile}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {language === 'tr' 
                    ? 'Profil düzenleme özelliği yakında eklenecek...'
                    : 'Profile editing feature will be added soon...'
                  }
                </p>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="btn-primary w-full"
                >
                  {language === 'tr' ? 'Tamam' : 'OK'}
                </button>
              </div>
            </div>
          )}

          {/* Change Password Modal (Örnek - gerçek uygulamada state yönetimi gerekli) */}
          {isChangingPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">{texts.changePassword}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {language === 'tr' 
                    ? 'Şifre değiştirme özelliği yakında eklenecek...'
                    : 'Password change feature will be added soon...'
                  }
                </p>
                <button 
                  onClick={() => setIsChangingPassword(false)}
                  className="btn-primary w-full"
                >
                  {language === 'tr' ? 'Tamam' : 'OK'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;