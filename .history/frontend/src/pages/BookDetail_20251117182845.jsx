import React from 'react';
import { useParams } from 'react-router-dom';

const BookDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Book Details - {id}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Book detail page coming soon...
        </p>
      </div>
    </div>
  );
};

export default BookDetail;