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
      if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined');
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
      client = new MongoClient(mongoUri);
      await client.connect();
      console.log('✅ Connected to MongoDB');

      const db = client.db();
      const loansCollection = db.collection('loans');
      const booksCollection = db.collection('books');

      // 1. Kitap bilgilerini al
      let bookTitle = 'Unknown Book';
      let bookCover = '/images/default-book-cover.jpg';

      // Önce kendi database'imizde ara
      let book;
      
      try {
        book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
      } catch (e) {
        // ObjectId değilse, googleBooksId veya diğer alanlarda ara
        book = await booksCollection.findOne({
          $or: [
            { googleBooksId: bookId },
            { isbn: bookId }
          ]
        });
      }

      if (book) {
        bookTitle = book.title || 'Unknown Book';
        bookCover = book.coverImage || book.thumbnail || '/images/default-book-cover.jpg';
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
      const existingLoan = await loansCollection.findOne({
        bookId: bookId,
        userId: '1', // loans.js ile aynı userId
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

      // 3. Yeni ödünç kaydı oluştur - loans.js formatında
      const newLoan = {
        userId: '1', // 🔥 loans.js ile AYNI userId
        bookId: bookId,
        bookTitle: bookTitle,
        bookCover: bookCover,
        borrowedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 gün sonra
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
      console.error('❌ Borrow Function Error:', error);
      
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