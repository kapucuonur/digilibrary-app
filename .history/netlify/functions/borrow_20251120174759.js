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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'RETURNED', 'OVERDUE'], default: 'ACTIVE' }
});

const Loan = mongoose.models.Loan || mongoose.model('Loan', loanSchema);

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectDB();
    
    if (event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body);
      
      // GELİŞTİRİLMİŞ AUTH KONTROLÜ
      const authHeader = event.headers.authorization;
      console.log('🔐 Auth header:', authHeader);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Token gerekli. Lütfen tekrar giriş yapın.' 
          })
        };
      }

      const token = authHeader.split(' ')[1];
      console.log('🔐 Token received:', token.substring(0, 20) + '...');

      // Token doğrulama - basit versiyon
      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Geçersiz token' 
          })
        };
      }

      console.log('📖 Borrow request for book:', bookId);

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
        console.error('❌ Google Books API error:', error.message);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Kitap Google Books\'ta bulunamadı' 
          })
        };
      }
      
      // Due date hesapla (14 gün sonra)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Mock user ID - TOKEN'dan user ID çekilecek
      // Şimdilik sabit bir user ID kullan
      const mockUserId = '65a1b2c3d4e5f6a7b8c9d0e1';

      // Kullanıcının zaten bu kitabı ödünç alıp almadığını kontrol et
      const existingLoan = await Loan.findOne({
        userId: mockUserId,
        bookId: bookId,
        status: 'ACTIVE'
      });

      if (existingLoan) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false,
            error: 'Bu kitabı zaten ödünç almışsınız' 
          })
        };
      }

      // Loan kaydı oluştur
      const loan = new Loan({
        userId: mockUserId,
        bookId: bookId,
        bookTitle: book.volumeInfo.title,
        dueDate: dueDate,
        status: 'ACTIVE'
      });

      await loan.save();

      console.log('✅ Book borrowed successfully. Loan ID:', loan._id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı! 🎉`,
          loanId: loan._id,
          dueDate: dueDate.toISOString().split('T')[0],
          bookTitle: book.volumeInfo.title
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Method not allowed' 
      })
    };

  } catch (error) {
    console.error('❌ Borrow function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Kitap ödünç alınırken hata oluştu: ' + error.message
      })
    };
  }
};