// netlify/functions/loans.js
const { MongoClient } = require('mongodb');

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
    const path = event.path;
    console.log('📚 Loans function path:', path);

    // ÖDÜNÇ KİTAPLARIMI GETİR
    if (path === '/.netlify/functions/loans/my-loans' && event.httpMethod === 'GET') {
      console.log('📖 Getting user loans');
      
      // MOCK DATA - MongoDB bağlantısı çözülene kadar
      const mockLoans = [
        {
          id: 'mock-loan-1',
          bookId: 'x_zOCwAAQBAJ',
          bookTitle: 'Demo Kitap 1',
          bookCover: '/images/default-book-cover.jpg',
          borrowedDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        },
        {
          id: 'mock-loan-2', 
          bookId: 'uJlLw50Xk14C',
          bookTitle: 'Demo Kitap 2',
          bookCover: '/images/default-book-cover.jpg',
          borrowedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ];

      console.log('✅ Returning mock loans:', mockLoans.length, 'items');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: mockLoans
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found: ' + path })
    };

  } catch (error) {
    console.error('❌ Loans function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error: ' + error.message,
        // Mock data dön - kullanıcı en azından boş liste görsün
        data: []
      })
    };
  }
};