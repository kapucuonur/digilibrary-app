import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Calendar, MapPin } from 'lucide-react';

const BookCard = ({ book }) => {
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

  return (
    <div className="book-card group">
      {/* Book Cover */}
      <div className="book-cover overflow-hidden">
        <img
          src={coverImage || '/images/default-book-cover.jpg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Book Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {author}
        </p>

        {/* Category */}
        <div className="mb-3">
          <span className="badge-primary text-xs">
            {category}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span>{averageRating?.toFixed(1) || '0.0'}</span>
            <span>({totalRatings || 0})</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{availableCopies} available</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{publishedYear}</span>
          </div>
          
          {book.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{book.location.shelf}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={`/books/${_id}`}
          className="btn-primary w-full text-sm py-2 mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export const BookCardSkeleton = () => {
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