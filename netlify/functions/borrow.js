import { MongoClient, ObjectId } from 'mongodb';

// Axios
import axios from 'axios';

export const handler = async (event, context) => {
  console.log('=== BORROW FUNCTION DEBUG START ===');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

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
    // Body parse
    const body = JSON.parse(event.body || '{}');
    const bookId = body.bookId;
    console.log('📖 Received bookId:', bookId);

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

    // Google Books API test
    console.log('🔑 Checking Google Books API key...');
    const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;
    console.log('🔑 API Key exists:', !!googleBooksKey);

    if (!googleBooksKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Google Books API key konfigüre edilmemiş' 
        })
      };
    }

    // Test Google Books API - DÜZELTİLMİŞ KISIM
    console.log('🌐 Testing Google Books API...');
    
    const testUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${googleBooksKey}`;
    console.log('🔗 API URL:', testUrl);

    let book;
    try {
      // Dynamic import YERİNE doğrudan axios kullanın
      const response = await axios.get(testUrl, { timeout: 10000 });
      book = response.data;
      console.log('✅ Google Books API success!');
      console.log('📚 Book title:', book.volumeInfo.title);
      console.log('👤 Authors:', book.volumeInfo.authors);
    } catch (googleError) {
      console.error('❌ Google Books API error details:');
      console.error('Status:', googleError.response?.status);
      console.error('Status text:', googleError.response?.statusText);
      console.error('Data:', googleError.response?.data);
      console.error('Message:', googleError.message);
      
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: `Google Books API hatası: ${googleError.response?.status || googleError.message}` 
        })
      };
    }

    // MongoDB test
    console.log('🗄️ Testing MongoDB connection...');
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 MongoDB URI exists:', !!mongoUri);

    if (!mongoUri) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'MongoDB URI konfigüre edilmemiş' 
        })
      };
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✅ MongoDB connected successfully');
    
    const db = client.db();
    const loansCollection = db.collection('loans');

    // Create loan
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newLoan = {
      userId: 'temp-user-123',
      bookId: bookId,
      bookTitle: book.volumeInfo.title,
      bookAuthors: book.volumeInfo.authors || [],
      bookCover: book.volumeInfo.imageLinks?.thumbnail,
      borrowDate: new Date(),
      dueDate: dueDate,
      status: 'ACTIVE',
       fineAmount: 0,
      paidAmount: 0,
      fineDays: 0,
      paymentHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Saving loan to database...');
    const result = await loansCollection.insertOne(newLoan);
    console.log('✅ Loan saved with ID:', result.insertedId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı!`,
        loanId: result.insertedId,
        dueDate: dueDate.toISOString().split('T')[0],
        bookTitle: book.volumeInfo.title
      })
    };

  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Beklenmeyen hata: ' + error.message
      })
    };
  } finally {
    if (client) {
      await client.close();
      console.log('🔗 MongoDB connection closed');
    }
    console.log('=== BORROW FUNCTION DEBUG END ===');
  }
};