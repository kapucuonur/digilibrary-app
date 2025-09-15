import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Calendar, BookOpen } from 'lucide-react';
import { loanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';

const BookCard = ({ book, onBorrowSuccess, viewMode = 'grid', onBorrow }) => {
  const { isAuthenticated } = useAuth();
  const [borrowing, setBorrowing] = useState(false);
  const { t, language } = useLanguage();

  const {
    _id,
    title,
    author,
    coverImage,
    category,
    averageRating,
    totalRatings,
    availableCopies,
    publishedYear,
    googleBooksId
  } = book;

  const safeAverageRating = typeof averageRating === 'number' ? averageRating : 
                           typeof averageRating === 'string' ? parseFloat(averageRating) : 0;
  
  const safeTotalRatings = typeof totalRatings === 'number' ? totalRatings : 
                          typeof totalRatings === 'string' ? parseInt(totalRatings) : 0;

  const formattedRating = safeAverageRating > 0 ? safeAverageRating.toFixed(1) : '0.0';
  const formattedTotalRatings = safeTotalRatings > 0 ? safeTotalRatings : 0;

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      toast.error(language === 'tr' 
        ? 'Ödünç almak için giriş yapmalısınız'
        : 'You must login to borrow books'
      );
      return;
    }

    if (availableCopies < 1) {
      toast.error(language === 'tr'
        ? 'Bu kitap şu anda müsait değil'
        : 'This book is currently unavailable'
      );
      return;
    }

    try {
      setBorrowing(true);
      
      // EĞER onBorrow PROP'U VARSA NETLIFY FUNCTION KULLAN
      if (onBorrow) {
        const bookId = googleBooksId || _id;
        const result = await onBorrow(bookId);
        toast.success(result.message);
      } 
      // YOKSA ESKİ loanService KULLAN
      else {
        const response = await loanService.borrow(_id);
        toast.success(response.data.message);
      }
      
      if (onBorrowSuccess) {
        onBorrowSuccess();
      }
    } catch (error) {
      console.error('Borrow error:', error);
      toast.error(error.response?.data?.message || error.message || 
        (language === 'tr' ? 'Ödünç alma başarısız' : 'Borrow failed')
      );
    } finally {
      setBorrowing(false);
    }
  };

  // ... mevcut diğer fonksiyonlar değişmeden kalacak
  const getAuthorText = () => {
    return author || (language === 'tr' ? 'Yazar Bilinmiyor' : 'Unknown Author');
  };

  const getCategoryText = () => {
    return category || (language === 'tr' ? 'Genel' : 'General');
  };

  const getAvailableText = () => {
    return language === 'tr' ? 'mevcut' : 'available';
  };

  const getYearText = () => {
    return publishedYear || (language === 'tr' ? 'Bilinmiyor' : 'Unknown');
  };

  const getBorrowButtonText = () => {
    if (borrowing) return '...';
    if (availableCopies > 0) return t('books.borrow');
    return language === 'tr' ? 'Müsait Değil' : 'Unavailable';
  };

  // Liste görünümü için
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex-shrink-0 w-16 h-24 overflow-hidden rounded">
          <img
            src={coverImage || '/images/default-book-cover.jpg'}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/default-book-cover.jpg';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {getAuthorText()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <span className="badge-primary text-xs">
              {getCategoryText()}
            </span>

            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{formattedRating}</span>
              <span>({formattedTotalRatings})</span>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className={availableCopies > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                {availableCopies || 0} {getAvailableText()}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{getYearText()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/books/${_id}`}
            className="btn-outline text-sm py-2 px-3"
          >
            {language === 'tr' ? 'Detaylar' : 'Details'}
          </Link>
          
          <button
            onClick={handleBorrow}
            disabled={borrowing || availableCopies < 1}
            className={`btn-primary flex items-center justify-center gap-1 text-sm py-2 px-3 ${
              availableCopies < 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <BookOpen className="h-3 w-3" />
            {getBorrowButtonText()}
          </button>
        </div>
      </div>
    );
  }

  // Grid görünümü (default)
  return (
    <div className="book-card group">
      <div className="book-cover overflow-hidden">
        <img
          src={coverImage || '/images/default-book-cover.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/images/default-book-cover.jpg';
          }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {getAuthorText()}
        </p>

        <div className="mb-3">
          <span className="badge-primary text-xs">
            {getCategoryText()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span>{formattedRating}</span>
            <span>({formattedTotalRatings})</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span className={availableCopies > 0 ? 'text-green-600' : 'text-red-600'}>
              {availableCopies || 0} {getAvailableText()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{getYearText()}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <Link
            to={`/books/${_id}`}
            className="btn-outline flex-1 text-sm py-2 text-center"
          >
            {language === 'tr' ? 'Detaylar' : 'Details'}
          </Link>
          
          <button
            onClick={handleBorrow}
            disabled={borrowing || availableCopies < 1}
            className={`btn-primary flex items-center justify-center gap-1 text-sm py-2 px-3 flex-1 ${
              availableCopies < 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <BookOpen className="h-3 w-3" />
            {getBorrowButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

// BookCardSkeleton component'ini viewMode ile güncelle
export const BookCardSkeleton = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex-shrink-0 w-16 h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-card animate-pulse">
      <div className="book-cover bg-gray-300 dark:bg-gray-600 mb-3"></div>
      
      <div className="flex-1 flex flex-col">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
        
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3"></div>
        
        <div className="flex justify-between mb-3">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
        
        <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded mt-auto"></div>
      </div>
    </div>
  );
};

export default BookCard;