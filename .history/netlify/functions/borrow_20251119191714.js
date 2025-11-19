// netlify/functions/borrow.js
import { MongoClient } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    let client;
    
    try {
      // MongoDB URI kontrolü
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        console.error('❌ MONGODB_URI is not defined');
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Database configuration error' })
        };
      }

      console.log('🔗 MongoDB URI found, connecting...');

      const { bookId } = JSON.parse(event.body);
      
      if (!bookId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Book ID is required' })
        };
      }

      console.log('📖 Borrowing book ID:', bookId);

      // MongoDB'ye bağlan
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });

      await client.connect();
      console.log('✅ Connected to MongoDB');

      const db = client.db();
      const loansCollection = db.collection('loans');
      const booksCollection = db.collection('books');

      // 1. Kitap bilgilerini al
      let bookTitle = 'Unknown Book';
      let bookCover = '/images/default-book-cover.jpg';

      // Önce kendi database'imizde ara
      const book = await booksCollection.findOne({ 
        $or: [
          { _id: bookId },
          { googleBooksId: bookId }
        ]
      });

      if (book) {
        bookTitle = book.title || 'Unknown Book';
        bookCover = book.coverImage || '/images/default-book-cover.jpg';
        console.log('📚 Book found in database:', bookTitle);
      } else {
        // Google Books API'den al
        try {
          console.log('🔍 Fetching from Google Books API...');
          const googleResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}`
          );
          
          if (googleResponse.ok) {
            const bookData = await googleResponse.json();
            bookTitle = bookData.volumeInfo?.title || 'Unknown Book';
            bookCover = bookData.volumeInfo?.imageLinks?.thumbnail || '/images/default-book-cover.jpg';
            console.log('📚 Book from Google API:', bookTitle);
          }
        } catch (googleError) {
          console.warn('⚠️ Google Books API error:', googleError.message);
        }
      }

      // 2. Aynı kitap zaten ödünç alınmış mı kontrol et
      // 🔥 NOT: Şimdilik tüm kullanıcılar için kontrol ediyoruz
      const existingLoan = await loansCollection.findOne({
        bookId: bookId,
        status: 'active'
      });

      if (existingLoan) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Bu kitap şu anda başka bir kullanıcı tarafından ödünç alınmış' 
          })
        };
      }

      // 3. Yeni ödünç kaydı oluştur
      const newLoan = {
        userId: 'demo-user', // 🔥 GERÇEK UYGULAMADA AUTH TOKEN'DAN AL
        bookId: bookId,
        bookTitle: bookTitle,
        bookCover: bookCover,
        borrowedDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 gün sonra
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
          loanId: result.insertedId.toString(),
          dueDate: newLoan.dueDate.toISOString().split('T')[0],
          bookId: bookId,
          bookTitle: bookTitle
        })
      };

    } catch (error) {
      console.error('❌ MongoDB Borrow Error:', error);
      
      let errorMessage = 'Ödünç alma başarısız';
      if (error.name === 'MongoServerSelectionError') {
        errorMessage = 'Database bağlantı hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Database sunucusuna bağlanılamıyor.';
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
          console.error('Error closing MongoDB connection:', closeErr);
        });
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};