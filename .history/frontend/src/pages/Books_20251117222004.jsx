import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
import BookCard, { BookCardSkeleton } from '../components/common/BookCard';
import { Search, Filter, Grid, List, RotateCcw } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookService.getAll();
      console.log('📚 Tüm kitaplar:', response.data);
      
      const booksData = response.data.data || [];
      setBooks(booksData);
    } catch (error) {
      console.error('❌ Kitaplar yüklenemedi:', error);
      setError('Kitaplar yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
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
      console.log('🔍 Arama yapılıyor:', searchTerm);
      
      const response = await bookService.search(searchTerm);
      console.log('🔍 Arama sonuçları:', response.data);
      
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('❌ Arama hatası:', error);
      setError('Arama sırasında hata oluştu: ' + error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Arama terimi değişince otomatik arama yap
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kitaplar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Yükleniyor...' : 
             searchTerm ? `"${searchTerm}" araması için ${searchResults.length} sonuç` :
             `${books.length} kitap bulundu`}
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
              Tekrar Dene
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
                  placeholder="Kitap, yazar veya kategori ara..."
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
                  {isSearching ? 'Aranıyor...' : `"${searchTerm}" için sonuçlar`}
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
                  <span>Tüm Kitaplar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  `"${searchTerm}" için ${searchResults.length} sonuç bulundu`
                ) : (
                  `Toplam ${books.length} kitap`
                )}
              </p>
              
              {searchTerm && searchResults.length === 0 && !isSearching && (
                <button 
                  onClick={handleSearch}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Tekrar Ara
                </button>
              )}
            </div>

            {/* Books */}
            {displayedBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedBooks.map((book, index) => (
                  <BookCard 
                    key={book._id || book.id || index} 
                    book={book} 
                    onBorrowSuccess={loadBooks}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kitap yok'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 
                    'Farklı bir arama terimi deneyin' : 
                    'Kitaplar yükleniyor veya henüz eklenmemiş'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="btn-primary"
                  >
                    Tüm Kitapları Gör
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