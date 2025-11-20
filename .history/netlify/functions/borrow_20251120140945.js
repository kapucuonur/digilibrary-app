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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectDB();
    
    if (event.httpMethod === 'POST') {
      const { bookId } = JSON.parse(event.body);
      
      // Auth kontrolü - basit versiyon
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token gerekli' })
        };
      }

      console.log('📖 Borrow request for book:', bookId);

      // Google Books'tan kitap bilgisi al
      const axios = require('axios');
      const bookResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
      );
      
      const book = bookResponse.data;
      
      // Due date hesapla (14 gün sonra)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Mock user ID - gerçek uygulamada token'dan alınacak
      const mockUserId = '65a1b2c3d4e5f6a7b8c9d0e1';

      // Loan kaydı oluştur
      const loan = new Loan({
        userId: mockUserId,
        bookId: bookId,
        bookTitle: book.volumeInfo.title,
        dueDate: dueDate,
        status: 'ACTIVE'
      });

      await loan.save();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `"${book.volumeInfo.title}" kitabı başarıyla ödünç alındı! 🎉`,
          loanId: loan._id,
          dueDate: dueDate.toISOString().split('T')[0]
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('❌ Borrow function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Kitap ödünç alınırken hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};