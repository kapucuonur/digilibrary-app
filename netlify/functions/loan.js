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
    const authHeader = event.headers.authorization;

    if (!authHeader) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // BORROW BOOK
    if (path === '/borrow' && event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Kitap başarıyla ödünç alındı!',
          loanId: 'loan-' + Date.now(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      };
    }

    // GET MY LOANS
    if (path === '/my-loans' && event.httpMethod === 'GET') {
      const mockLoans = [
        {
          id: 'loan-1',
          bookId: 'book1',
          bookTitle: 'Sample Book 1',
          borrowedDate: '2024-01-15',
          dueDate: '2024-01-29',
          status: 'active'
        },
        {
          id: 'loan-2', 
          bookId: 'book2',
          bookTitle: 'Sample Book 2',
          borrowedDate: '2024-01-10',
          dueDate: '2024-01-24',
          status: 'active'
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: mockLoans })
      };
    }

    // RETURN BOOK
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};