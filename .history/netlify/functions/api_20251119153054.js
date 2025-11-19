const axios = require('axios');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

    console.log('API Path:', path);

    // 📚 KİTAP ROUTES
    if (path === '/books' && event.httpMethod === 'GET') {
      const { q, id } = event.queryStringParameters;
      
      if (id) {
        // Tekil kitap
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${id}?key=${GOOGLE_BOOKS_API_KEY}`
        );
        
        const item = response.data;
        const book = {
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
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: book })
        };
      }
      
      // Tüm kitaplar veya arama
      const query = q || 'popular books';
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40&key=${GOOGLE_BOOKS_API_KEY}`
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

    // 🔐 AUTH ROUTES
    if (path === '/auth/login' && event.httpMethod === 'POST') {
      const { email, password } = JSON.parse(event.body);
      
      const user = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: email,
        role: 'USER'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: user,
          token: 'mock-jwt-token'
        })
      };
    }

    if (path === '/auth/me' && event.httpMethod === 'GET') {
      const user = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'USER'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    // 📖 LOANS ROUTES
    if (path === '/loans/borrow' && event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body);
      
      // Google Books'tan kitap bilgisi al
      const bookResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`
      );
      
      const book = bookResponse.data;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı! 🎉`,
          loanId: 'loan-' + Date.now(),
          dueDate: dueDate.toISOString().split('T')[0]
        })
      };
    }

    if (path === '/loans/my-loans' && event.httpMethod === 'GET') {
      const mockLoans = [];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: mockLoans })
      };
    }

    if (path === '/loans/return' && event.httpMethod === 'POST') {
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
      body: JSON.stringify({ error: 'Route not found: ' + path })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};