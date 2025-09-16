import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import BookCard, { BookCardSkeleton } from '../components/common/BookCard';
import { Search, Filter, Grid, List, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookService.getAll();
      console.log('📚 Books loaded:', response.data);
      
      const booksData = response.data.data || [];
      setBooks(booksData);
    } catch (error) {
      console.error('❌ Failed to load books:', error);
      setError(language === 'tr' 
        ? 'Kitaplar yüklenirken bir hata oluştu: ' + error.message
        : 'Failed to load books: ' + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // BORROW BOOK FONKSİYONU
  // BORROW BOOK FONKSİYONU - DÜZELTİLMİŞ VERSİYON
const borrowBook = async (bookId) => {
  try {
    console.log(`🚀 Sending borrow request for book: ${bookId}`);
    
    const response = await fetch('/.netlify/functions/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId })
    });

    // Önce response'u kontrol et
    if (!response.ok) {
      // Hata durumunda response'dan mesajı al
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error('❌ Error parsing error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    // Başarılı response'u parse et
    const data = await response.json();
    console.log('✅ Borrow successful:', data);
    
    // Kullanıcıya başarı mesajı göster
    if (data.success) {
      alert(data.message || (language === 'tr' ? 'Kitap başarıyla ödünç alındı!' : 'Book borrowed successfully!'));
      
      // Kitapları yeniden yükle
      loadBooks();
      
      return data;
    } else {
      throw new Error(data.message || 'Unknown error occurred');
    }
    
  } catch (error) {
    console.error('❌ Borrow failed:', error);
    
    // Kullanıcı dostu hata mesajları
    let userMessage = error.message;
    
    if (error.message.includes('Failed to fetch')) {
      userMessage = language === 'tr' 
        ? 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.'
        : 'Cannot connect to server. Please check your internet connection.';
    } else if (error.message.includes('500')) {
      userMessage = language === 'tr'
        ? 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
        : 'Server error. Please try again later.';
    } else if (error.message.includes('404')) {
      userMessage = language === 'tr'
        ? 'Kitap bulunamadı. Lütfen farklı bir kitap seçin.'
        : 'Book not found. Please select a different book.';
    }
    
    alert(`${language === 'tr' ? 'Ödünç alma başarısız' : 'Borrow failed'}: ${userMessage}`);
    throw error; // Hata yukarı fırlatılsın
  }
};

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setError('');
      console.log('🔍 Searching:', searchTerm);
      
      const response = await bookService.search(searchTerm);
      console.log('🔍 Search results:', response.data);
      
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('❌ Search error:', error);
      setError(language === 'tr'
        ? 'Arama sırasında hata oluştu: ' + error.message
        : 'Search error: ' + error.message
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const displayedBooks = searchTerm.trim() ? searchResults : books;

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Dinamik metinler için yardımcı fonksiyonlar
  const getSearchPlaceholder = () => {
    return language === 'tr' 
      ? 'Kitap, yazar veya kategori ara...'
      : 'Search books, authors, or categories...';
  };

  const getSearchingText = () => {
    return language === 'tr' ? 'Aranıyor...' : 'Searching...';
  };

  const getResultsText = () => {
    return language === 'tr' ? 'için sonuçlar' : 'results for';
  };

  const getTotalBooksText = () => {
    if (loading) return t('common.loading');
    if (searchTerm) {
      return language === 'tr'
        ? `"${searchTerm}" araması için ${searchResults.length} sonuç`
        : `"${searchTerm}" search results: ${searchResults.length} found`;
    }
    return language === 'tr'
      ? `${books.length} kitap bulundu`
      : `${books.length} books found`;
  };

  const getResultsInfoText = () => {
    if (searchTerm) {
      return language === 'tr'
        ? `"${searchTerm}" için ${searchResults.length} sonuç bulundu`
        : `Found ${searchResults.length} results for "${searchTerm}"`;
    }
    return language === 'tr'
      ? `Toplam ${books.length} kitap`
      : `Total ${books.length} books`;
  };

  const getNoResultsText = () => {
    return searchTerm 
      ? (language === 'tr' ? 'Arama sonucu bulunamadı' : 'No results found')
      : (language === 'tr' ? 'Henüz kitap yok' : 'No books available');
  };

  const getNoResultsDescription = () => {
    return searchTerm
      ? (language === 'tr' ? 'Farklı bir arama terimi deneyin' : 'Try a different search term')
      : (language === 'tr' ? 'Kitaplar yükleniyor veya henüz eklenmemiş' : 'Books are loading or not added yet');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('nav.books')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {getTotalBooksText()}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button 
              onClick={loadBooks}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              {language === 'tr' ? 'Tekrar Dene' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  {isSearching ? getSearchingText() : `"${searchTerm}" ${getResultsText()}`}
                </p>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="btn-outline flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{language === 'tr' ? 'Tüm Kitaplar' : 'All Books'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }>
            {[...Array(8)].map((_, i) => (
              <BookCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                {getResultsInfoText()}
              </p>
              
              {searchTerm && searchResults.length === 0 && !isSearching && (
                <button 
                  onClick={handleSearch}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {language === 'tr' ? 'Tekrar Ara' : 'Search Again'}
                </button>
              )}
            </div>

            {/* Books */}
            {displayedBooks.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
              }>
                {displayedBooks.map((book, index) => (
                  <BookCard 
                    key={book._id || book.id || index} 
                    book={book} 
                    onBorrowSuccess={loadBooks}
                    viewMode={viewMode}
                    onBorrow={borrowBook}  
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {getNoResultsText()}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {getNoResultsDescription()}
                </p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="btn-primary"
                  >
                    {language === 'tr' ? 'Tüm Kitapları Gör' : 'View All Books'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Books;