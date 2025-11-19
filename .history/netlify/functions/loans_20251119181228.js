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

    // MongoDB connection
    const MONGODB_URI = process.env.MONGODB_URI;
    const client = new MongoClient(MONGODB_URI);
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const loansCollection = db.collection('loans');

    // ÖDÜNÇ KİTAPLARIMI GETİR
    if (path === '/.netlify/functions/loans/my-loans' && event.httpMethod === 'GET') {
      console.log('📖 Getting user loans from DATABASE');
      
      // 🔥 DATABASE'DEN GERÇEK DATA ÇEK
      const userLoans = await loansCollection.find({ 
        userId: '1', // 🔥 Gerçek uygulamada token'dan alınacak
        status: 'active' 
      }).toArray();
      
      console.log('✅ Database loans:', userLoans);

      // Format response
      const formattedLoans = userLoans.map(loan => ({
        id: loan._id.toString(),
        bookId: loan.bookId,
        bookTitle: loan.bookTitle || 'Unknown Book',
        bookCover: loan.bookCover || '/images/default-book-cover.jpg',
        borrowedDate: loan.borrowedDate,
        dueDate: loan.dueDate,
        status: loan.status
      }));

      await client.close();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: formattedLoans
        })
      };
    }

    await client.close();
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found: ' + path })
    };

  } catch (error) {
    console.error('❌ Loans database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Database error: ' + error.message })
    };
  }
};