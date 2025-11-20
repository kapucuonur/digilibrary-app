import { MongoClient, ObjectId } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let client;

  try {
    if (event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body || '{}');
      
      console.log('📖 Borrow request for book:', bookId);

      if (!bookId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Kitap ID gereklidir' 
          })
        };
      }

      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI not configured');
      }

      client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db();
      const loansCollection = db.collection('loans');

      // Google Books'tan kitap bilgisi al
      const axios = require('axios');
      const bookResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
      );
      
      const book = bookResponse.data;
      
      // Due date hesapla (14 gün sonra)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // AYNI USER ID - loans.js ile uyumlu
      const userId = 'temp-user-123';

      // Yeni loan oluştur - loans.js ile aynı formatta
      const newLoan = {
        userId: userId,
        bookId: bookId,
        bookTitle: book.volumeInfo.title,
        bookAuthors: book.volumeInfo.authors || [],
        bookCover: book.volumeInfo.imageLinks?.thumbnail || null,
        borrowDate: new Date(),
        dueDate: dueDate,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await loansCollection.insertOne(newLoan);

      console.log('✅ Book borrowed successfully. Loan ID:', result.insertedId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı! 🎉`,
          loanId: result.insertedId,
          dueDate: dueDate.toISOString().split('T')[0]
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Method not allowed' 
      })
    };

  } catch (error) {
    console.error('❌ Borrow function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Kitap ödünç alınırken hata oluştu: ' + error.message
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};