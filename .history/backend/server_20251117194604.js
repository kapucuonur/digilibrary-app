import express from 'express';
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
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiLibrary API çalışıyor! (Development Mode)',
    timestamp: new Date().toISOString(),
    database: 'mock data - development mode'
  });
});

// Mock books data
const mockBooks = [
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
  },
  {
    _id: '4',
    title: '1984',
    author: 'George Orwell',
    category: 'Bilim Kurgu',
    description: 'Distopik bir gelecek vizyonu',
    coverImage: '/images/default-book-cover.jpg',
    publishedYear: 1949,
    publisher: 'Can Yayınları',
    pageCount: 328,
    availableCopies: 4,
    totalCopies: 4,
    averageRating: 4.7,
    totalRatings: 156
  },
  {
    _id: '5',
    title: 'Küçük Prens',
    author: 'Antoine de Saint-Exupéry',
    category: 'Çocuk',
    description: 'Felsefi bir çocuk klasiği',
    coverImage: '/images/default-book-cover.jpg',
    publishedYear: 1943,
    publisher: 'Can Çocuk Yayınları',
    pageCount: 96,
    availableCopies: 8,
    totalCopies: 8,
    averageRating: 4.9,
    totalRatings: 89
  }
];

app.get('/api/books', async (req, res) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { search, category } = req.query;
    
    let filteredBooks = mockBooks;
    
    // Search filter
    if (search) {
      filteredBooks = mockBooks.filter(book => 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Category filter
    if (category && category !== 'all') {
      filteredBooks = filteredBooks.filter(book => 
        book.category === category
      );
    }

    res.json({
      success: true,
      data: filteredBooks,
      count: filteredBooks.length,
      total: mockBooks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitaplar yüklenirken hata oluştu'
    });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = mockBooks.find(b => b._id === bookId);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitap detayları yüklenirken hata oluştu'
    });
  }
});

// Auth endpoints
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

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = {
      id: 'user_' + Date.now(),
      firstName,
      lastName,
      email,
      role: 'USER',
      createdAt: new Date()
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

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock users
    const mockUsers = [
      { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'Kullanıcı' },
      { email: 'onur@example.com', password: 'password123', firstName: 'Onur', lastName: 'Kapucu' }
    ];

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.json({
        success: true,
        message: 'Giriş başarılı',
        user: {
          id: 'user_' + Date.now(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: 'USER'
        },
        token: 'mock-jwt-token-' + Date.now()
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
    // Mock user data
    const user = {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'Kullanıcı',
      email: 'test@example.com',
      role: 'USER',
      preferences: {
        language: 'tr',
        theme: 'light'
      },
      stats: {
        totalBorrowed: 12,
        currentlyBorrowed: 2,
        favorites: 5
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

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
    const categories = [
      'Roman', 'Bilim Kurgu', 'Fantastik', 'Biyografi', 'Tarih',
      'Bilim', 'Teknoloji', 'Felsefe', 'Psikoloji', 'Kişisel Gelişim',
      'Çocuk', 'Gençlik', 'Şiir', 'Sanat', 'Diğer'
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler yüklenirken hata oluştu'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Bir hata oluştu!',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route bulunamadı' 
  });
});

// Server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server http://localhost:${PORT} portunda çalışıyor`);
  console.log(`📚 DigiLibrary Backend Service Active`);
  console.log(`🌐 Frontend: http://localhost:3000`);
  console.log(`💾 Database: Mock Data (Development Mode)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Books API: http://localhost:${PORT}/api/books`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(`📚 Categories: http://localhost:${PORT}/api/categories`);
});