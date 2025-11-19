import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';
// BookCard ve BookCardSkeleton'ı doğru import et
import BookCard, { BookCardSkeleton } from '../components/common/BookCard';
import { Search, Filter, Grid, List } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookService.getAll();
      
      const booksData = response.data.data || response.data.books || [];
      setBooks(booksData);
    } catch (error) {
      console.error('❌ Kitaplar yüklenemedi:', error);
      setError('Kitaplar yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    if (!book) return false;
    
    const title = book.title || '';
    const author = book.author || '';
    const category = book.category || '';
    
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           author.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kitaplar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Yükleniyor...' : `${books.length} kitap bulundu`}
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
                  className="form-input pl-10"
                />
              </div>
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

              <button className="btn-outline flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtreler</span>
              </button>
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
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? (
                  `"${searchTerm}" için ${filteredBooks.length} sonuç bulundu`
                ) : (
                  `Toplam ${filteredBooks.length} kitap`
                )}
              </p>
            </div>

            {/* Books */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book, index) => (
                  <BookCard key={book._id || book.id || index} book={book} />
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
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Farklı bir arama terimi deneyin' : 'Kitaplar yükleniyor...'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Books;