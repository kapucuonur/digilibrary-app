import { MongoClient, ObjectId } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let client;

  try {
    const path = event.path;
    console.log('📚 Loans function path:', path, 'Method:', event.httpMethod);

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not configured');
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const loansCollection = db.collection('loans');

    // ÖDÜNÇ KİTAPLARIMI GETİR - GET /.netlify/functions/loans/my-loans
    if (path.includes('/loans/my-loans') && event.httpMethod === 'GET') {
      console.log('📖 Getting user loans from DATABASE');
      
      // BORROW.JS İLE AYNI USER ID'Yİ KULLAN
      const userId = 'temp-user-123';
      
      console.log('🔍 Searching loans for user:', userId);

      const userLoans = await loansCollection.find({ 
        userId: userId,
        status: 'ACTIVE'  // BORROW.JS'DE 'ACTIVE' OLARAK KAYDEDİLİYOR
      }).sort({ borrowDate: -1 }).toArray();
      
      console.log('✅ Database loans found:', userLoans.length);
      console.log('📊 Loans:', userLoans);

      const formattedLoans = userLoans.map(loan => ({
        id: loan._id.toString(),
        bookId: loan.bookId,
        bookTitle: loan.bookTitle || 'Unknown Book',
        bookAuthors: loan.bookAuthors || ['Bilinmeyen Yazar'],
        bookCover: loan.bookCover || 'https://via.placeholder.com/128x192?text=No+Cover',
        borrowDate: loan.borrowDate,
        dueDate: loan.dueDate,
        status: loan.status,
        daysRemaining: Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
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

    // KİTAP İADE ET - POST /.netlify/functions/loans/return
    if (path.includes('/loans/return') && event.httpMethod === 'POST') {
      const { loanId } = JSON.parse(event.body || '{}');
      console.log('📖 Returning loan:', loanId);

      if (!loanId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Loan ID gereklidir' 
          })
        };
      }

      // Loan'ı bul ve status'ünü "returned" yap
      const result = await loansCollection.updateOne(
        { 
          _id: new ObjectId(loanId)
        },
        { 
          $set: { 
            status: 'RETURNED',
            returnDate: new Date(),
            updatedAt: new Date()
          } 
        }
      );

      if (result.modifiedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Ödünç kaydı bulunamadı' 
          })
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

    // LOAN HISTORY - GET /.netlify/functions/loans/history
    if (path.includes('/loans/history') && event.httpMethod === 'GET') {
      const userId = 'temp-user-123';
      
      const loanHistory = await loansCollection.find({ 
        userId: userId,
        status: 'RETURNED'
      }).sort({ borrowDate: -1 }).toArray();

      const formattedHistory = loanHistory.map(loan => ({
        id: loan._id.toString(),
        bookId: loan.bookId,
        bookTitle: loan.bookTitle,
        bookCover: loan.bookCover,
        borrowDate: loan.borrowDate,
        returnDate: loan.returnDate,
        status: loan.status
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: formattedHistory
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Route not found: ' + path 
      })
    };

  } catch (error) {
    console.error('❌ Loans function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Database error: ' + error.message
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};
