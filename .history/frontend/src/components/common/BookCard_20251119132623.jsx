import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Calendar, BookOpen } from 'lucide-react';
import { loanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const BookCard = ({ book, onBorrowSuccess, viewMode = 'grid' }) => {
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
      toast.error('You must login to borrow books');
      return;
    }

    if (availableCopies < 1) {
      toast.error('This book is currently unavailable');
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
      toast.error(error.response?.data?.message || 'Borrow failed');
    } finally {
      setBorrowing(false);
    }
  };

  // Liste görünümü için
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Cover Image - Liste için daha küçük */}
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

        {/* Book Info - Liste görünümü */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {author || 'Unknown Author'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            {/* Category */}
            <span className="badge-primary text-xs">
              {category || 'General'}
            </span>

            {/* Rating */}
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{formattedRating}</span>
              <span>({formattedTotalRatings})</span>
            </div>

            {/* Available Copies */}
            <div className="flex items-center space-x-1 text-xs">
              <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className={availableCopies > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                {availableCopies || 0} available
              </span>
            </div>

            {/* Published Year */}
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{publishedYear || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Liste görünümü */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/books/${_id}`}
            className="btn-outline text-sm py-2 px-3"
          >
            Details
          </Link>
          
          <button
            onClick={handleBorrow}
            disabled={borrowing || availableCopies < 1}
            className={`btn-primary flex items-center justify-center gap-1 text-sm py-2 px-3 ${
              availableCopies < 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {borrowing ? (
              '...'
            ) : availableCopies > 0 ? (
              <>
                <BookOpen className="h-3 w-3" />
                Borrow
              </>
            ) : (
              'Unavailable'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Grid görünümü (default)
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
          {author || 'Unknown Author'}
        </p>

        {/* Category */}
        <div className="mb-3">
          <span className="badge-primary text-xs">
            {category || 'General'}
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
              {availableCopies || 0} available
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{publishedYear || 'Unknown'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/books/${_id}`}
            className="btn-outline flex-1 text-sm py-2 text-center"
          >
            Details
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
                Borrow
              </>
            ) : (
              'Unavailable'
            )}
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
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-9 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Grid skeleton (mevcut)
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

// Default export
export default BookCard;