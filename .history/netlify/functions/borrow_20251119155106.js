exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Borrow request
  if (event.httpMethod === 'POST') {
    try {
      console.log('📚 Borrow function called');
      
      const body = JSON.parse(event.body);
      const bookId = body.bookId;
      
      console.log('📖 Borrowing book ID:', bookId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: '🎉 Kitap başarıyla ödünç alındı!',
          loanId: 'loan-' + Date.now(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          bookId: bookId
        })
      };
    } catch (error) {
      console.error('❌ Borrow error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Ödünç alma başarısız' })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};