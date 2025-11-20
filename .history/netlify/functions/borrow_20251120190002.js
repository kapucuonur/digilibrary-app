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
  // CORS HEADERS - GELİŞTİRİLMİŞ
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('🔐 BORROW FUNCTION CALLED');
    console.log('🔐 Headers:', event.headers);
    console.log('🔐 Authorization header:', event.headers.authorization);
    console.log('🔐 Method:', event.httpMethod);
    console.log('🔐 Path:', event.path);

    await connectDB();
    
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { bookId } = body;
      
      console.log('📖 Book ID:', bookId);

      // AUTH KONTROLÜ - GELİŞTİRİLMİŞ
      const authHeader = event.headers.authorization || event.headers.Authorization;
      console.log('🔐 Full auth header:', authHeader);

      if (!authHeader) {
        console.log('❌ NO AUTH HEADER FOUND');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Token gerekli. Lütfen tekrar giriş yapın.' 
          })
        };
      }

      // Token'ı ayıkla
      let token;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else {
        token = authHeader;
      }

      console.log('🔐 Token extracted:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Geçersiz token formatı' 
          })
        };
      }

      // TOKEN DOĞRULAMA - BASİT (şimdilik token varsa kabul et)
      console.log('✅ Token accepted (simple validation)');

      // Google Books'tan kitap bilgisi al
      const axios = require('axios');
      let book;
      try {
        console.log('📚 Fetching book from Google Books:', bookId);
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
            message: 'Kitap Google Books\'ta bulunamadı' 
          })
        };
      }
      
      // Due date hesapla (14 gün sonra)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // MOCK USER ID - TOKEN'dan user ID çekilecek
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
            message: 'Bu kitabı zaten ödünç almışsınız' 
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
        message: 'Method not allowed' 
      })
    };

  } catch (error) {
    console.error('❌ Borrow function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Kitap ödünç alınırken hata oluştu: ' + error.message
      })
    };
  }
};