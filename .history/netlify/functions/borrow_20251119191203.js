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
      // Environment variable kontrolü
      if (!process.env.MONGODB_URI) {
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
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      console.log('✅ Connected to MongoDB');

      const db = client.db();
      const loansCollection = db.collection('loans');
      const booksCollection = db.collection('books');

      // 1. Kitap bilgilerini al
      let book = await booksCollection.findOne({ 
        $or: [
          { _id: bookId },
          { googleBooksId: bookId }
        ]
      });

      let bookTitle = 'Unknown Book';
      let bookCover = '/images/default-book-cover.jpg';

      if (book) {
        bookTitle = book.title || 'Unknown Book';
        bookCover = book.coverImage || '/images/default-book-cover.jpg';
      } else {
        // Google Books API'den kitap bilgisi al (isteğe bağlı)
        if (process.env.GOOGLE_BOOKS_API_KEY) {
          try {
            const googleResponse = await fetch(
              `https://www.googleapis.com/books/v1/volumes/${bookId}`
            );
            if (googleResponse.ok) {
              const bookData = await googleResponse.json();
              bookTitle = bookData.volumeInfo?.title || 'Unknown Book';
              bookCover = bookData.volumeInfo?.imageLinks?.thumbnail || '/images/default-book-cover.jpg';
            }
          } catch (googleError) {
            console.warn('Google Books API error:', googleError);
          }
        }
      }

      // 2. Aynı kitap zaten ödünç alınmış mı kontrol et
      const existingLoan = await loansCollection.findOne({
        bookId: bookId,
        userId: 'current-user', // 🔥 Gerçek uygulamada auth'dan al
        status: 'active'
      });

      if (existingLoan) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Bu kitap zaten ödünç alınmış' 
          })
        };
      }

      // 3. Yeni ödünç kaydı oluştur
      const newLoan = {
        userId: 'current-user', // 🔥 GERÇEK USER ID BURAYA
        bookId: bookId,
        bookTitle: bookTitle,
        bookCover: bookCover,
        borrowedDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 gün
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await loansCollection.insertOne(newLoan);
      console.log('✅ Loan saved to database:', result.insertedId);

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
      console.error('❌ Borrow function error:', error);
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
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};