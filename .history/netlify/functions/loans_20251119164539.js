exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
      
      // Mock data - gerçek uygulamada database'den gelir
      const mockLoans = [
        {
          id: 'loan-1',
          bookId: 'uJlLw50Xk14C',
          bookTitle: 'Sample Book 1',
          bookCover: 'https://via.placeholder.com/128x192?text=Book+1',
          borrowedDate: '2024-01-15',
          dueDate: '2024-01-29',
          status: 'active'
        },
        {
          id: 'loan-2',
          bookId: 'abc123',
          bookTitle: 'Sample Book 2', 
          bookCover: 'https://via.placeholder.com/128x192?text=Book+2',
          borrowedDate: '2024-01-10',
          dueDate: '2024-01-24',
          status: 'active'
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: mockLoans 
        })
      };
    }

    // İADE ET
    if (path === '/.netlify/functions/loans/return' && event.httpMethod === 'POST') {
      console.log('📚 Returning book');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
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
    console.error('❌ Loans error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};