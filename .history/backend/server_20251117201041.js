import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Gelişmiş mock data
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
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiLibrary API çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/books', (req, res) => {
  res.json({ 
    success: true,
    data: books,
    count: books.length
  });
});

app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b._id === req.params.id);
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
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === '123456') {
    res.json({
      success: true,
      message: 'Giriş başarılı',
      user: { 
        id: '1', 
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
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Tüm alanları doldurun'
    });
  }

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla oluşturuldu',
    user: { 
      id: '2', 
      firstName, 
      lastName, 
      email, 
      role: 'USER' 
    },
    token: 'mock-jwt-token-' + Date.now()
  });
});

app.get('/api/auth/me', (req, res) => {
  // Basit mock user - gerçek uygulamada JWT decode edilecek
  res.json({
    success: true,
    user: {
      id: '1',
      firstName: 'Test',
      lastName: 'Kullanıcı',
      email: 'test@example.com',
      role: 'USER',
      preferences: {
        language: 'tr',
        theme: 'light'
      }
    }
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🎉 DIGILIBARY BACKEND ÇALIŞIYOR: http://localhost:${PORT}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`   📖 Books: http://localhost:${PORT}/api/books`);
  console.log(`   🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   👤 Register: http://localhost:${PORT}/api/auth/register`);
});