// netlify/functions/loans.js - RETURN ENDPOINT EKLE
import { MongoClient, ObjectId } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path;
    console.log('📚 Loans function path:', path);

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured');
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const loansCollection = db.collection('loans');

    // KİTAP İADE ET
    if (path === '/.netlify/functions/loans/return' && event.httpMethod === 'POST') {
      const { loanId } = JSON.parse(event.body);
      console.log('📖 Returning loan:', loanId);

      if (!loanId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Loan ID is required' })
        };
      }

      // Loan'ı bul ve status'ünü "returned" yap
      const result = await loansCollection.updateOne(
        { 
          $or: [
            { _id: new ObjectId(loanId) },
            { id: loanId }
          ]
        },
        { 
          $set: { 
            status: 'returned',
            returnedDate: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      if (result.modifiedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Loan not found' })
        };
      }

      console.log('✅ Book returned successfully');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Kitap başarıyla iade edildi!'
        })
      };
    }

    // ÖDÜNÇ KİTAPLARIMI GETİR (mevcut kod)
    if (path === '/.netlify/functions/loans/my-loans' && event.httpMethod === 'GET') {
      console.log('📖 Getting user loans from DATABASE');
      
      const userLoans = await loansCollection.find({ 
        userId: '1',
        status: 'active' 
      }).sort({ borrowedDate: -1 }).toArray();
      
      console.log('✅ Database loans:', userLoans.length);

      const formattedLoans = userLoans.map(loan => ({
        id: loan._id.toString(),
        bookId: loan.bookId,
        bookTitle: loan.bookTitle || 'Unknown Book',
        bookCover: loan.bookCover || '/images/default-book-cover.jpg',
        borrowedDate: loan.borrowedDate,
        dueDate: loan.dueDate,
        status: loan.status
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: formattedLoans
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
        error: 'Database error: ' + error.message,
        data: []
      })
    };
  }
};