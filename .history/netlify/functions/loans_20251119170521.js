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
      
      // GERÇEK DATA - Ödünç alınan kitaplar burada olacak
      // Şu an için mock data, ama gerçek uygulamada database'den gelir
      const userLoans = [
        {
          id: 'loan-1',
          bookId: 'uJlLw50Xk14C',
          bookTitle: 'The Great Gatsby',
          bookCover: 'https://books.google.com/books/content?id=uJlLw50Xk14C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
          borrowedDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active'
        },
        {
          id: 'loan-2',
          bookId: 'abc123', 
          bookTitle: 'To Kill a Mockingbird',
          bookCover: 'https://via.placeholder.com/128x192/4F46E5/FFFFFF?text=Book+2',
          borrowedDate: '2024-01-10',
          dueDate: '2024-01-24',
          status: 'active'
        }
      ];

      console.log('✅ Returning loans:', userLoans);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: userLoans 
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