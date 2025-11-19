const axios = require('axios');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/loans', '');
    
    // ÖDÜNÇ ALMA
    if (path === '/borrow' && event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body);
      
      // Google Books'tan kitap detaylarını al
      const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
      const bookResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
      );
      
      const book = bookResponse.data;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 gün sonra

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı!`,
          loanId: 'loan-' + Date.now(),
          dueDate: dueDate.toISOString().split('T')[0],
          book: {
            id: bookId,
            title: book.volumeInfo.title,
            author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown Author',
            coverImage: book.volumeInfo.imageLinks?.thumbnail
          }
        })
      };
    }

    // ÖDÜNÇ KİTAPLARIM
    if (path === '/my-loans' && event.httpMethod === 'GET') {
      // Mock data - gerçek uygulamada database'den gelmeli
      const mockLoans = [
        {
          id: 'loan-1',
          bookId: 'book1',
          bookTitle: 'Örnek Kitap 1',
          bookCover: '/images/default-book-cover.jpg',
          borrowedDate: '2024-01-15',
          dueDate: '2024-01-29',
          status: 'active'
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: mockLoans })
      };
    }

    // İADE ETME
    if (path === '/return' && event.httpMethod === 'POST') {
      const { loanId } = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Kitap başarıyla iade edildi!'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Loans error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Ödünç alma işlemi başarısız' })
    };
  }
};