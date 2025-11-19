const axios = require('axios');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
    
    if (event.httpMethod === 'GET') {
      const { q, id } = event.queryStringParameters;
      
      // Tekil kitap
      if (id) {
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
      
      // Arama veya tüm kitaplar
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

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Books API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch books' })
    };
  }
};