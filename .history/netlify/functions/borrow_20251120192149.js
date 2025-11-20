import { MongoClient, ObjectId } from 'mongodb';

export const handler = async (event, context) => {
  console.log('=== BORROW FUNCTION START ===');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Sadece POST kabul et
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Method not allowed' 
      })
    };
  }

  let client;

  try {
    // Body'yi parse et
    let bookId;
    try {
      const body = JSON.parse(event.body || '{}');
      bookId = body.bookId;
      console.log('📖 Book ID:', bookId);
    } catch (parseError) {
      console.error('Body parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Geçersiz JSON formatı' 
        })
      };
    }

    // Validation
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

    // MongoDB connection
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 MongoDB URI:', mongoUri ? 'SET' : 'NOT SET');
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable not configured');
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ MongoDB connected');
    
    const db = client.db();
    const loansCollection = db.collection('loans');

    // Google Books API - Basit hata yönetimi
    let book;
    try {
      console.log('📚 Fetching book from Google Books...');
      // Dynamic import for axios
      const { default: axios } = await import('axios');
      
      const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;
      if (!googleBooksKey) {
        throw new Error('GOOGLE_BOOKS_API_KEY not configured');
      }

      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`,
        {
          params: { key: googleBooksKey },
          timeout: 10000
        }
      );
      
      book = response.data;
      console.log('✅ Book found:', book.volumeInfo.title);
    } catch (googleError) {
      console.error('❌ Google Books error:', googleError.message);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Kitap Google Books\'ta bulunamadı veya API hatası' 
        })
      };
    }

    // Due date hesapla
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // User ID - geçici sabit
    const userId = 'temp-user-123';

    // Yeni loan oluştur
    const newLoan = {
      userId: userId,
      bookId: bookId,
      bookTitle: book.volumeInfo.title || 'Bilinmeyen Kitap',
      bookAuthors: book.volumeInfo.authors || ['Bilinmeyen Yazar'],
      bookCover: book.volumeInfo.imageLinks?.thumbnail || null,
      borrowDate: new Date(),
      dueDate: dueDate,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Saving loan to database...');
    const result = await loansCollection.insertOne(newLoan);
    console.log('✅ Loan saved with ID:', result.insertedId);

    // Başarılı response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı! 🎉`,
        loanId: result.insertedId,
        dueDate: dueDate.toISOString().split('T')[0],
        bookTitle: book.volumeInfo.title
      })
    };

  } catch (error) {
    console.error('❌ BORROW FUNCTION ERROR:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Sunucu hatası: ' + error.message
      })
    };
  } finally {
    // MongoDB connection'ı kapat
    if (client) {
      try {
        await client.close();
        console.log('🔗 MongoDB connection closed');
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
    console.log('=== BORROW FUNCTION END ===');
  }
};