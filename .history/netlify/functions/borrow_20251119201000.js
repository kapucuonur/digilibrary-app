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

      // MongoDB'ye bağlan
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      console.log('🔄 Connecting to MongoDB...');
      await client.connect();
      console.log('✅ Connected to MongoDB successfully!');

      const db = client.db();
      console.log('📊 Using database:', db.databaseName);

      const loansCollection = db.collection('loans');
      const booksCollection = db.collection('books');

      // 1. Kitap bilgilerini al
      let bookTitle = 'Unknown Book';
      let bookCover = '/images/default-book-cover.jpg';

      // Önce books collection'da ara
      let book = await booksCollection.findOne({ googleBooksId: bookId });
      
      if (book) {
        bookTitle = book.title || 'Unknown Book';
        bookCover = book.coverImage || '/images/default-book-cover.jpg';
        console.log('📚 Book found in database:', bookTitle);
      } else {
        // Google Books API'den al
        try {
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
          console.warn('Google Books API error:', googleError.message);
        }
      }

      // 2. Aynı kitap zaten ödünç alınmış mı kontrol et
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
      console.error('❌ BORROW ERROR:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Ödünç alma başarısız: ' + error.message
        })
      };
    } finally {
      if (client) {
        await client.close();
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