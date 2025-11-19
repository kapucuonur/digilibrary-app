const axios = require('axios');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
    const path = event.path.replace('/.netlify/functions/api', '');

    // 🔐 AUTH ROUTES
    if (path === '/auth/login' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      // Mock login - gerçek projede database bağlantısı
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: { 
            id: '1', 
            firstName: 'Test', 
            lastName: 'User', 
            email: body.email 
          },
          token: 'mock-jwt-token-12345'
        })
      };
    }

    if (path === '/auth/me' && event.httpMethod === 'GET') {
      const token = event.headers.authorization;
      if (!token) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com'
        })
      };
    }

    // 📚 BOOKS ROUTES - GOOGLE BOOKS API
    if (path === '/books' && event.httpMethod === 'GET') {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=popular&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
      );
      
      const books = response.data.items.map(item => ({
        _id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown Author',
        category: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
        averageRating: item.volumeInfo.averageRating || 0,
        totalRatings: item.volumeInfo.ratingsCount || 0,
        availableCopies: Math.floor(Math.random() * 5) + 1,
        publishedYear: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.substring(0,4) : 'Unknown',
        coverImage: item.volumeInfo.imageLinks?.thumbnail || '/images/default-book-cover.jpg',
        description: item.volumeInfo.description
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: books })
      };
    }

    if (path === '/books/search/google' && event.httpMethod === 'GET') {
      const query = event.queryStringParameters.q;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=50&key=${GOOGLE_BOOKS_API_KEY}`
      );
      
      const books = response.data.items.map(item => ({
        _id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown Author',
        category: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
        averageRating: item.volumeInfo.averageRating || 0,
        totalRatings: item.volumeInfo.ratingsCount || 0,
        availableCopies: Math.floor(Math.random() * 5) + 1,
        publishedYear: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.substring(0,4) : 'Unknown',
        coverImage: item.volumeInfo.imageLinks?.thumbnail || '/images/default-book-cover.jpg'
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: books })
      };
    }

    // 📖 LOAN ROUTES
    if (path === '/loans/borrow' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Kitap başarıyla ödünç alındı!',
          loanId: 'loan-' + Date.now()
        })
      };
    }

    if (path === '/loans/my-loans' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          data: [
            {
              id: '1',
              bookId: 'book1',
              bookTitle: 'Sample Book',
              borrowedDate: '2024-01-15',
              dueDate: '2024-02-15',
              status: 'active'
            }
          ]
        })
      };
    }

    // 👤 USER PROFILE
    if (path === '/users/profile' && event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Profil güncellendi',
          user: body 
        })
      };
    }

    // Not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found: ' + path })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};