const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
      await client.connect();
      console.log('✅ Connected to MongoDB for borrow');
      
      const db = client.db();
      const loansCollection = db.collection('loans');
      const booksCollection = db.collection('books');

      const body = JSON.parse(event.body);
      const bookId = body.bookId;
      
      console.log('📖 Borrowing book ID:', bookId);

      // 1. Kitap bilgilerini al (Google Books API veya database'den)
      let bookTitle = 'Unknown Book';
      let bookCover = '/images/default-book-cover.jpg';
      
      try {
        // Önce database'de kitap var mı kontrol et
        const book = await booksCollection.findOne({ googleBooksId: bookId });
        if (book) {
          bookTitle = book.title;
          bookCover = book.coverImage;
        } else {
          // Google Books API'den kitap bilgisi al
          const googleResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
          );
          const bookData = await googleResponse.json();
          bookTitle = bookData.volumeInfo?.title || 'Unknown Book';
          bookCover = bookData.volumeInfo?.imageLinks?.thumbnail || '/images/default-book-cover.jpg';
        }
      } catch (bookError) {
        console.warn('⚠️ Could not fetch book details:', bookError);
      }

      // 2. Database'e ödünç kaydı ekle
      const newLoan = {
        userId: '1', // 🔥 Gerçek uygulamada token'dan alınacak
        bookId: bookId,
        bookTitle: bookTitle,
        bookCover: bookCover,
        borrowedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await loansCollection.insertOne(newLoan);
      console.log('✅ Loan saved to database:', result.insertedId);

      await client.close();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `🎉 "${bookTitle}" kitabı başarıyla ödünç alındı!`,
          loanId: result.insertedId.toString(),
          dueDate: newLoan.dueDate,
          bookId: bookId
        })
      };
    } catch (error) {
      console.error('❌ Borrow database error:', error);
      await client.close();
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Ödünç alma başarısız: ' + error.message })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};