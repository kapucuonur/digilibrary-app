import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Calendar, MapPin, BookOpen } from 'lucide-react';
import { loanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const BookCard = ({ book, onBorrowSuccess }) => {
  const { isAuthenticated } = useAuth();
  const [borrowing, setBorrowing] = useState(false);

  const {
    _id,
    title,
    author,
    coverImage,
    category,
    averageRating,
    totalRatings,
    availableCopies,
    publishedYear
  } = book;

  // Rating değerini güvenli şekilde işle
  const safeAverageRating = typeof averageRating === 'number' ? averageRating : 
                           typeof averageRating === 'string' ? parseFloat(averageRating) : 0;
  
  const safeTotalRatings = typeof totalRatings === 'number' ? totalRatings : 
                          typeof totalRatings === 'string' ? parseInt(totalRatings) : 0;

  const formattedRating = safeAverageRating > 0 ? safeAverageRating.toFixed(1) : '0.0';
  const formattedTotalRatings = safeTotalRatings > 0 ? safeTotalRatings : 0;

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      toast.error('Ödünç almak için giriş yapmalısınız');
      return;
    }

    if (availableCopies < 1) {
      toast.error('Bu kitap şu anda müsait değil');
      return;
    }

    try {
      setBorrowing(true);
      const response = await loanService.borrow(_id);
      
      toast.success(response.data.message);
      if (onBorrowSuccess) {
        onBorrowSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ödünç alma başarısız');
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className="book-card group">
      {/* Book Cover */}
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

      {/* Book Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {author || 'Yazar Bilinmiyor'}
        </p>

        {/* Category */}
        <div className="mb-3">
          <span className="badge-primary text-xs">
            {category || 'Genel'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span>{formattedRating}</span>
            <span>({formattedTotalRatings})</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span className={availableCopies > 0 ? 'text-green-600' : 'text-red-600'}>
              {availableCopies || 0} mevcut
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{publishedYear || 'Bilinmiyor'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/books/${_id}`}
            className="btn-outline flex-1 text-sm py-2 text-center"
          >
            Detaylar
          </Link>
          
          <button
            onClick={handleBorrow}
            disabled={borrowing || availableCopies < 1}
            className={`btn-primary flex items-center justify-center gap-1 text-sm py-2 px-3 flex-1 ${
              availableCopies < 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {borrowing ? (
              '...'
            ) : availableCopies > 0 ? (
              <>
                <BookOpen className="h-3 w-3" />
                Ödünç Al
              </>
            ) : (
              'Müsait Değil'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;