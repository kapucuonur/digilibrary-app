const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Loan Schema
const loanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'ACTIVE' }
});

const Loan = mongoose.models.Loan || mongoose.model('Loan', loanSchema);

exports.handler = async function(event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // DEBUG: Tüm request bilgilerini logla
  console.log('=== BORROW FUNCTION DEBUG ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);
  console.log('=============================');

  try {
    await connectDB();
    
    if (event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body || '{}');
      
      // GEÇİCİ ÇÖZÜM: TOKEN KONTROLÜNÜ ATLA - SADECE KİTAP ID KONTROL ET
      console.log('📖 Processing borrow for book:', bookId);

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

      // Google Books'tan kitap bilgisi al
      const axios = require('axios');
      let book;
      try {
        const bookResponse = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        book = bookResponse.data;
        console.log('📚 Book found:', book.volumeInfo.title);
      } catch (error) {
        console.error('Google Books error:', error.message);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Kitap bulunamadı' 
          })
        };
      }
      
      // Due date hesapla
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // GEÇİCİ: Sabit user ID kullan
      const userId = 'temp-user-123';

      // Loan kaydı oluştur
      const loan = new Loan({
        userId: userId,
        bookId: bookId,
        bookTitle: book.volumeInfo.title,
        dueDate: dueDate
      });

      await loan.save();

      console.log('✅ SUCCESS: Book borrowed -', book.volumeInfo.title);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `"${book.volumeInfo.title}" başarıyla ödünç alındı!`,
          loanId: loan._id,
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
    console.error('❌ Borrow error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Sunucu hatası: ' + error.message
      })
    };
  }
};