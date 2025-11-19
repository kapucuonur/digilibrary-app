const axios = require('axios');

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
    
    if (event.path === '/.netlify/functions/books/search') {
      const { q } = event.queryStringParameters;
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=40&key=${GOOGLE_BOOKS_API_KEY}`
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: response.data.items || [] })
      };
    }

    if (event.path === '/.netlify/functions/books/all') {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=javascript&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: response.data.items || [] })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch books' })
    };
  }
};