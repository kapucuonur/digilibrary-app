import React, { useState, useEffect } from 'react';
import { bookService } from '../services/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await bookService.getAll();
      console.log('API Response:', response.data);
      
      // Backend response formatına göre kitapları al
      const booksData = response.data.data || response.data.books || [];
      setBooks(booksData);
    } catch (error) {
      console.error('Kitaplar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Kitaplar yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kitaplar</h1>
        
        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Henüz hiç kitap bulunmuyor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map(book => (
              <div key={book._id || book.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
                <p className="text-gray-600 mb-1"><strong>Yazar:</strong> {book.author}</p>
                <p className="text-gray-600 mb-1"><strong>Kategori:</strong> {book.category}</p>
                {book.description && (
                  <p className="text-gray-500 text-sm mt-2">{book.description}</p>
                )}
                <div className="mt-4 flex justify-between items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {book.availableCopies || 0} kopya mevcut
                  </span>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Detaylar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;