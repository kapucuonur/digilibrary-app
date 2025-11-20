import React, { createContext, useState, useContext, useEffect } from 'react';

// Translation dictionaries
const translations = {
  tr: {
    // Navigation
    'nav.home': 'Ana Sayfa',
    'nav.books': 'Kitaplar',
    'nav.dashboard': 'Panel',
    'nav.profile': 'Profil',
    'nav.admin': 'Yönetim',
    'nav.login': 'Giriş Yap',
    'nav.register': 'Kayıt Ol',
    'nav.logout': 'Çıkış Yap',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.error': 'Hata',
    'common.success': 'Başarılı',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.view': 'Görüntüle',
    'common.search': 'Ara...',
    'common.actions': 'İşlemler',
    
    // Auth
    'auth.login': 'Giriş Yap',
    'auth.register': 'Kayıt Ol',
    'auth.email': 'E-posta',
    'auth.password': 'Şifre',
    'auth.firstName': 'Ad',
    'auth.lastName': 'Soyad',
    'auth.phone': 'Telefon',
    'auth.confirmPassword': 'Şifre Tekrar',
    
    // Books
    'books.title': 'Kitap Başlığı',
    'books.author': 'Yazar',
    'books.category': 'Kategori',
    'books.isbn': 'ISBN',
    'books.description': 'Açıklama',
    'books.publishedYear': 'Yayın Yılı',
    'books.publisher': 'Yayınevi',
    'books.pageCount': 'Sayfa Sayısı',
    'books.availableCopies': 'Mevcut Kopya',
    'books.borrow': 'Ödünç Al',
    'books.return': 'İade Et',
    'books.renew': 'Uzat',
    'books.addToFavorites': 'Favorilere Ekle',
    'books.removeFromFavorites': 'Favorilerden Çıkar',
    
    // Categories
    'categories.novel': 'Roman',
    'categories.scienceFiction': 'Bilim Kurgu',
    'categories.fantasy': 'Fantastik',
    'categories.biography': 'Biyografi',
    'categories.history': 'Tarih',
    'categories.science': 'Bilim',
    'categories.technology': 'Teknoloji',
    'categories.philosophy': 'Felsefe',
    'categories.psychology': 'Psikoloji',
    'categories.personalDevelopment': 'Kişisel Gelişim',
    'categories.children': 'Çocuk',
    'categories.youth': 'Gençlik',
    'categories.poetry': 'Şiir',
    'categories.art': 'Sanat',
    'categories.other': 'Diğer',
  
     // Home Page - YENİ EKLENEN KEY'LER
    'home.heroTitle': 'DigiLibrary\'e Hoş Geldiniz',
    'home.heroSubtitle': 'Binlerce kitabı keşfedin, dijital olarak ödünç alın ve okuma deneyiminizi tek bir yerde yönetin.',
    'home.exploreBooks': 'Kitapları Keşfet',
    'home.joinNow': 'Hemen Katıl',
    'home.whyChoose': 'Neden DigiLibrary?',
    'home.whySubtitle': 'Modern kütüphane yönetimi parmaklarınızın ucunda',
    'home.feature1Title': 'Geniş Koleksiyon',
    'home.feature1Desc': 'Tüm türlerden ve kategorilerden binlerce kitaba erişin',
    'home.feature2Title': 'Kolay Yönetim',
    'home.feature2Desc': 'Basit ödünç alma, iade ve uzatma sistemi',
    'home.feature3Title': 'Değerlendir & Yorum Yap',
    'home.feature3Desc': 'Düşüncelerinizi paylaşın ve başkalarının harika kitaplar keşfetmesine yardımcı olun',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.books': 'Books',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search...',
    'common.actions': 'Actions',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.phone': 'Phone',
    'auth.confirmPassword': 'Confirm Password',
    
    // Books
    'books.title': 'Book Title',
    'books.author': 'Author',
    'books.category': 'Category',
    'books.isbn': 'ISBN',
    'books.description': 'Description',
    'books.publishedYear': 'Published Year',
    'books.publisher': 'Publisher',
    'books.pageCount': 'Page Count',
    'books.availableCopies': 'Available Copies',
    'books.borrow': 'Borrow',
    'books.return': 'Return',
    'books.renew': 'Renew',
    'books.addToFavorites': 'Add to Favorites',
    'books.removeFromFavorites': 'Remove from Favorites',
    
    // Categories
    'categories.novel': 'Novel',
    'categories.scienceFiction': 'Science Fiction',
    'categories.fantasy': 'Fantasy',
    'categories.biography': 'Biography',
    'categories.history': 'History',
    'categories.science': 'Science',
    'categories.technology': 'Technology',
    'categories.philosophy': 'Philosophy',
    'categories.psychology': 'Psychology',
    'categories.personalDevelopment': 'Personal Development',
    'categories.children': 'Children',
    'categories.youth': 'Youth',
    'categories.poetry': 'Poetry',
    'categories.art': 'Art',
    'categories.other': 'Other',

      // Home Page - YENİ EKLENEN KEY'LER
    'home.heroTitle': 'Welcome to DigiLibrary',
    'home.heroSubtitle': 'Discover thousands of books, borrow them digitally, and manage your reading all in one place.',
    'home.exploreBooks': 'Explore Books',
    'home.joinNow': 'Join Now',
    'home.whyChoose': 'Why Choose DigiLibrary?',
    'home.whySubtitle': 'Modern library management at your fingertips',
    'home.feature1Title': 'Vast Collection',
    'home.feature1Desc': 'Access thousands of books across all genres and categories',
    'home.feature2Title': 'Easy Management', 
    'home.feature2Desc': 'Simple borrowing, returns, and renewal system',
    'home.feature3Title': 'Rate & Review',
    'home.feature3Desc': 'Share your thoughts and help others discover great books',
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('digilibrary-language') || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('digilibrary-language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    t,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};