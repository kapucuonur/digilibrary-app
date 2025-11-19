import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiLibrary API çalışıyor!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/books', async (req, res) => {
  try {
    const books = [
      {
        _id: '1',
        title: 'Sefiller',
        author: 'Victor Hugo',
        category: 'Roman',
        description: 'Fransa tarihini arka plan alan insanlık dramı',
        coverImage: '/images/default-book-cover.jpg',
        publishedYear: 1862,
        publisher: 'İş Bankası Kültür Yayınları',
        pageCount: 432,
        availableCopies: 5,
        totalCopies: 5,
        averageRating: 4.7,
        totalRatings: 128
      },
      {
        _id: '2',
        title: 'Suç ve Ceza',
        author: 'Fyodor Dostoyevski',
        category: 'Roman',
        description: 'Raskolnikov\'un psikolojik çöküşünün hikayesi',
        coverImage: '/images/default-book-cover.jpg',
        publishedYear: 1866,
        publisher: 'Can Yayınları',
        pageCount: 704,
        availableCopies: 3,
        totalCopies: 3,
        averageRating: 4.8,
        totalRatings: 95
      },
      {
        _id: '3',
        title: 'Hayvan Çiftliği',
        author: 'George Orwell',
        category: 'Roman',
        description: 'Distopik bir siyasi hiciv',
        coverImage: '/images/default-book-cover.jpg',
        publishedYear: 1945,
        publisher: 'Can Yayınları',
        pageCount: 152,
        availableCopies: 7,
        totalCopies: 7,
        averageRating: 4.6,
        totalRatings: 203
      }
    ];

    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitaplar yüklenirken hata oluştu'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanları doldurun'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalı'
      });
    }

    const user = {
      id: 'user_' + Date.now(),
      firstName,
      lastName,
      email,
      role: 'USER'
    };

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === 'test@example.com' && password === 'password123') {
      res.json({
        success: true,
        message: 'Giriş başarılı',
        user: {
          id: 'user_123',
          firstName: 'Test',
          lastName: 'Kullanıcı',
          email: 'test@example.com',
          role: 'USER'
        },
        token: 'mock-jwt-token-123456'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında hata oluştu'
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'Kullanıcı',
      email: 'test@example.com',
      role: 'USER',
      preferences: {
        language: 'tr',
        theme: 'light'
      }
    };

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Bir hata oluştu!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route bulunamadı' 
  });
});

// PORT 5001 olarak sabit belirle
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server http://localhost:${PORT} portunda çalışıyor`);
  console.log(`📚 DigiLibrary Backend Service Active`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Not configured'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Books API: http://localhost:${PORT}/api/books`);
});