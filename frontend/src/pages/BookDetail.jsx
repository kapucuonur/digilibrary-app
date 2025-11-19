import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookService, loanService } from '../services/api';
import { ArrowLeft, Star, Users, Calendar, BookOpen, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const response = await bookService.getById(id);
      setBook(response.data.data);
    } catch (error) {
      console.error('Kitap detayları yüklenemedi:', error);
      toast.error('Kitap bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      toast.error('Ödünç almak için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    try {
      setBorrowing(true);
      const response = await loanService.borrow(id);
      toast.success(response.data.message);
      loadBook(); // Kitap bilgilerini yenile
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ödünç alma başarısız');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-6"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="w-full h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="md:w-2/3">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Kitap bulunamadı
          </h1>
          <Link to="/books" className="btn-primary">
            Kitaplara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Geri dön butonu */}
        <Link 
          to="/books" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kitaplara Geri Dön
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Kitap Kapağı */}
              <div className="md:w-1/3">
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={book.coverImage || '/images/default-book-cover.jpg'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/default-book-cover.jpg';
                    }}
                  />
                </div>
              </div>
              
              {/* Kitap Detayları */}
              <div className="md:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  {book.author}
                </p>

                {/* Kategori ve Rating */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="badge-primary">
                    {book.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {book.averageRating?.toFixed(1) || '0.0'} 
                      {book.totalRatings && ` (${book.totalRatings} değerlendirme)`}
                    </span>
                  </div>
                </div>

                {/* Kitap Bilgileri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Yayın Yılı:</strong> {book.publishedYear}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Sayfa Sayısı:</strong> {book.pageCount || 'Bilinmiyor'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <strong>Mevcut Kopya:</strong> {book.availableCopies || 0}
                    </span>
                  </div>
                  
                  {book.publisher && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Yayınevi:</strong> {book.publisher}
                      </span>
                    </div>
                  )}
                </div>

                {/* Açıklama */}
                {book.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Açıklama
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Ödünç Alma Butonu */}
                <div className="flex gap-4">
                  <button
                    onClick={handleBorrow}
                    disabled={borrowing || book.availableCopies < 1}
                    className={`btn-primary flex items-center gap-2 ${
                      book.availableCopies < 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    {borrowing ? 'İşleniyor...' : 
                     book.availableCopies > 0 ? 'Ödünç Al' : 'Müsait Değil'}
                  </button>
                  
                  {book.previewLink && (
                    <a
                      href={book.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      Önizleme
                    </a>
                  )}
                </div>

                {/* Uyarı Mesajları */}
                {book.availableCopies < 1 && (
                  <p className="text-red-600 text-sm mt-2">
                    Bu kitap şu anda müsait değil. Lütfen daha sonra tekrar kontrol edin.
                  </p>
                )}
                
                {!isAuthenticated && (
                  <p className="text-blue-600 text-sm mt-2">
                    Ödünç almak için giriş yapmalısınız.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;