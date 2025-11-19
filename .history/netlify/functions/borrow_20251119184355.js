// netlify/functions/borrow.js
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📖 Borrow function called');
    
    // Parse request body
    const { bookId } = JSON.parse(event.body);
    
    if (!bookId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Book ID is required' })
      };
    }

    console.log('Processing book ID:', bookId);

    // Mock success response - no database
    const mockResponse = {
      success: true,
      message: `🎉 "${bookId}" kitabı başarıyla ödünç alındı!`,
      loanId: 'mock-' + Date.now(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookId: bookId,
      bookTitle: `Book ${bookId}`,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Mock loan created:', mockResponse.loanId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResponse)
    };

  } catch (error) {
    console.error('❌ Error in borrow function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Ödünç alma başarısız: ' + error.message 
      })
    };
  }
};