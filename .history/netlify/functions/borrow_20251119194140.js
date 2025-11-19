// netlify/functions/borrow.js
import { MongoClient, ObjectId } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    let client;
    
    try {
      // MongoDB URI kontrolü - daha detaylı
      const mongoUri = process.env.MONGODB_URI;
      console.log('🔗 MongoDB URI:', mongoUri ? 'SET' : 'NOT SET');
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      const { bookId } = JSON.parse(event.body);
      
      if (!bookId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Book ID is required' })
        };
      }

      console.log('📖 Borrowing book ID:', bookId);

      // MongoDB'ye bağlan - timeout'ları artır
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 20000,
      });

      console.log('🔄 Connecting to MongoDB...');
      await client.connect();
      console.log('✅ Connected to MongoDB');

      const db = client.db();
      const loansCollection = db.collection('loans');
      const booksCollection = db.collection('books');

      console.log('📚 Checking if book exists...');

      // 1. Kitap bilgilerini al
      let bookTitle = 'Unknown Book';
      let bookCover = '/images/default-book-cover.jpg';

      // Önce kendi database'imizde ara
      let book;
      
      try {
        // ObjectId olarak dene
        book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
      } catch (e) {
        // ObjectId değilse, diğer alanlarda ara
        book = await booksCollection.findOne({
          $or: [
            { googleBooksId: bookId },
            { isbn: bookId },
            { title: { $regex: bookId, $options: 'i' } }
          ]
        });
      }

      if (book) {
        bookTitle = book.title || 'Unknown Book';
        bookCover = book.coverImage || book.thumbnail || '/images/default-book-cover.jpg';
        console.log('📚 Book found in database:', bookTitle);
      } else {
        console.log('📚 Book not found in database, using default info');
      }

      // 2. Aynı kitap zaten ödünç alınmış mı kontrol et
      console.log('🔍 Checking for existing loans...');
      const existingLoan = await loansCollection.findOne({
        bookId: bookId,
        userId: '1',
        status: 'active'
      });

      if (existingLoan) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: `"${bookTitle}" kitabı zaten ödünç almışsınız` 
          })
        };
      }

      // 3. Yeni ödünç kaydı oluştur
      console.log('💾 Creating new loan...');
      const newLoan = {
        userId: '1',
        bookId: bookId,
        bookTitle: bookTitle,
        bookCover: bookCover,
        borrowedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await loansCollection.insertOne(newLoan);
      console.log('✅ Loan saved to MongoDB, ID:', result.insertedId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `🎉 "${bookTitle}" kitabı başarıyla ödünç alındı!`,
          data: {
            id: result.insertedId.toString(),
            bookId: bookId,
            bookTitle: bookTitle,
            bookCover: bookCover,
            borrowedDate: newLoan.borrowedDate,
            dueDate: newLoan.dueDate,
            status: 'active'
          }
        })
      };

    } catch (error) {
      console.error('❌ BORROW FUNCTION ERROR:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Ödünç alma başarısız';
      
      if (error.name === 'MongoServerSelectionError') {
        errorMessage = 'Database bağlantı hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Database sunucusuna bağlanılamıyor. MongoDB connection string kontrol edin.';
      } else if (error.message.includes('MONGODB_URI')) {
        errorMessage = 'MongoDB bağlantı ayarları eksik. Lütfen sistem yöneticinize başvurun.';
      }
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: errorMessage,
          details: error.message 
        })
      };
    } finally {
      if (client) {
        await client.close().catch(closeErr => {
          console.error('Error closing connection:', closeErr);
        });
        console.log('🔌 MongoDB connection closed');
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};