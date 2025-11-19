import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Google Books API Key - Kendi key'ini buraya yaz
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || 'AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Data storage
let cachedBooks = [];
let loans = [];
let users = [
  { 
    id: '1', 
    email: 'test@example.com', 
    firstName: 'Test', 
    lastName: 'Kullanıcı', 
    password: '123456',
    role: 'USER',
    borrowedBooks: [],
    createdAt: new Date()
  }
];

// Google Books'tan kitap arama
const searchGoogleBooks = async (query, maxResults = 40) => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults: maxResults,
        key: GOOGLE_BOOKS_API_KEY,
        langRestrict: 'tr',
        printType: 'books',
        orderBy: 'relevance'
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Google Books API hatası:', error.message);
    return [];
  }
};

// Google Books verisini formatla
const formatBookData = (googleBook) => {
  const volumeInfo = googleBook.volumeInfo;
  const id = googleBook.id;
  
  // Rating değerlerini number olarak garantile
  const averageRating = volumeInfo.averageRating ? 
    parseFloat(volumeInfo.averageRating) : 
    parseFloat((Math.random() * 2 + 3).toFixed(1));
  
  const totalRatings = volumeInfo.ratingsCount ? 
    parseInt(volumeInfo.ratingsCount) : 
    Math.floor(Math.random() * 100);

  return {
    _id: id,
    title: volumeInfo.title || 'Başlık Yok',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Yok',
    category: volumeInfo.categories ? volumeInfo.categories[0] : 'Genel',
    description: volumeInfo.description || 'Açıklama yok',
    coverImage: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail.replace('http://', 'https://') : '/images/default-book-cover.jpg',
    publishedYear: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : new Date().getFullYear(),
    publisher: volumeInfo.publisher || 'Bilinmiyor',
    pageCount: volumeInfo.pageCount || 0,
    isbn: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers[0]?.identifier : 'ISBN Yok',
    language: volumeInfo.language || 'tr',
    availableCopies: Math.floor(Math.random() * 5) + 1,
    totalCopies: 5,
    averageRating: averageRating,
    totalRatings: totalRatings,
    googleBooksId: id,
    previewLink: volumeInfo.previewLink,
    infoLink: volumeInfo.infoLink
  };
};

// Mock kitaplar (fallback)
const getMockBooks = () => {
  return [
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
    },
    {
      _id: '4', 
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
    },
    {
      _id: '5', 
      title: 'Simyacı', 
      author: 'Paulo Coelho', 
      category: 'Roman',
      description: 'Kişisel keşif yolculuğu',
      coverImage: '/images/default-book-cover.jpg',
      publishedYear: 1988,
      publisher: 'Can Yayınları',
      pageCount: 208,
      availableCopies: 6,
      totalCopies: 6,
      averageRating: 4.5,
      totalRatings: 95
    },
    {
      _id: '6', 
      title: 'Kürk Mantolu Madonna', 
      author: 'Sabahattin Ali', 
      category: 'Roman',
      description: 'Aşk ve yalnızlık üzerine bir başyapıt',
      coverImage: '/images/default-book-cover.jpg',
      publishedYear: 1943,
      publisher: 'Yapı Kredi Yayınları',
      pageCount: 177,
      availableCopies: 4,
      totalCopies: 4,
      averageRating: 4.8,
      totalRatings: 67
    },
    {
      _id: '7', 
      title: 'İnce Memed', 
      author: 'Yaşar Kemal', 
      category: 'Roman',
      description: 'Anadolu\'nun destansı hikayesi',
      coverImage: '/images/default-book-cover.jpg',
      publishedYear: 1955,
      publisher: 'Yapı Kredi Yayınları',
      pageCount: 436,
      availableCopies: 5,
      totalCopies: 5,
      averageRating: 4.6,
      totalRatings: 89
    },
    {
      _id: '8', 
      title: 'Uçurtma Avcısı', 
      author: 'Khaled Hosseini', 
      category: 'Roman',
      description: 'Dostluk ve pişmanlık hikayesi',
      coverImage: '/images/default-book-cover.jpg',
      publishedYear: 2003,
      publisher: 'Everest Yayınları',
      pageCount: 375,
      availableCopies: 7,
      totalCopies: 7,
      averageRating: 4.7,
      totalRatings: 234
    }
  ];
};

// Popüler kitapları yükle
const loadPopularBooks = async () => {
  try {
    console.log('📚 Google Books\'tan kitaplar yükleniyor...');
    
    const searchQueries = [
      'subject:fiction',
      'subject:classics',
      'subject:romance',
      'subject:science+fiction',
      'subject:history',
      'subject:biography',
      'intitle:Orhan+Pamuk',
      'intitle:Elif+Şafak',
      'intitle:Yaşar+Kemal'
    ];
    
    let allBooks = [];
    
    for (const query of searchQueries) {
      try {
        const books = await searchGoogleBooks(query, 6);
        const formattedBooks = books.map(formatBookData);
        allBooks = [...allBooks, ...formattedBooks];
        
        console.log(`✅ "${query}" için ${formattedBooks.length} kitap yüklendi`);
        
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ "${query}" yüklenemedi:`, error.message);
      }
    }
    
    // Benzersiz kitaplar
    const uniqueBooks = allBooks.filter((book, index, self) => 
      index === self.findIndex(b => b._id === book._id)
    );
    
    cachedBooks = [...uniqueBooks, ...getMockBooks()].slice(0, 50);
    console.log(`🎉 TOPLAM ${cachedBooks.length} KİTAP YÜKLENDİ!`);
    
  } catch (error) {
    console.error('❌ Kitaplar yüklenemedi, mock data kullanılıyor:', error.message);
    cachedBooks = getMockBooks();
  }
};

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiLibrary API çalışıyor!',
    booksCount: cachedBooks.length,
    loansCount: loans.length,
    timestamp: new Date().toISOString()
  });
});

// Tüm kitapları getir
app.get('/api/books', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    
    let filteredBooks = cachedBooks;
    
    // Arama filtresi
    if (search) {
      filteredBooks = cachedBooks.filter(book => 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Kategori filtresi
    if (category && category !== 'all') {
      filteredBooks = filteredBooks.filter(book => 
        book.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Sayfalama
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBooks,
      count: paginatedBooks.length,
      total: filteredBooks.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredBooks.length / limit)
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kitaplar yüklenirken hata oluştu'
    });
  }
});

// Kitap detayı
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    
    // Önce cached kitaplarda ara
    let book = cachedBooks.find(b => b._id === bookId);
    
    // Eğer cached'de yoksa Google Books'tan getir
    if (!book) {
      const googleBooks = await searchGoogleBooks(`id:${bookId}`, 1);
      if (googleBooks.length > 0) {
        book = formatBookData(googleBooks[0]);
        cachedBooks.push(book);
      }
    }
    
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

// Kitap ara (Google Books'tan gerçek zamanlı)
app.get('/api/books/search/google', async (req, res) => {
  try {
    const { q, maxResults = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama terimi gereklidir'
      });
    }
    
    const googleBooks = await searchGoogleBooks(q, parseInt(maxResults));
    const formattedBooks = googleBooks.map(formatBookData);
    
    res.json({
      success: true,
      data: formattedBooks,
      count: formattedBooks.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Arama sırasında hata oluştu'
    });
  }
});

// Kategorileri getir
app.get('/api/categories', async (req, res) => {
  try {
    const categories = [...new Set(cachedBooks.map(book => book.category))].sort();
    
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

// ==================== AUTH ROUTES ====================

// Kullanıcı girişi
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir'
      });
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.json({
        success: true,
        message: 'Giriş başarılı',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        token: 'digilibrary-jwt-token-' + Date.now()
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

// Kullanıcı kaydı
app.post('/api/auth/register', (req, res) => {
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

    // Email kontrolü
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Yeni kullanıcı oluştur
    const newUser = {
      id: 'user_' + Date.now(),
      firstName,
      lastName,
      email,
      password,
      role: 'USER',
      borrowedBooks: [],
      createdAt: new Date()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      },
      token: 'digilibrary-jwt-token-' + Date.now()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu'
    });
  }
});

// Kullanıcı bilgileri
app.get('/api/auth/me', (req, res) => {
  try {
    // Basit mock user - gerçek uygulamada JWT decode edilecek
    const user = users[0]; // İlk kullanıcıyı döndür
    
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        preferences: {
          language: 'tr',
          theme: 'light'
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı'
    });
  }
});

// ==================== LOAN ROUTES ====================

// Ödünç alma
app.post('/api/loans/borrow', (req, res) => {
  try {
    const { bookId, userId = '1' } = req.body;
    
    const book = cachedBooks.find(b => b._id === bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Kitap bulunamadı'
      });
    }

    if (book.availableCopies < 1) {
      return res.status(400).json({
        success: false,
        message: 'Bu kitap şu anda müsait değil'
      });
    }

    // Ödünç alma kaydı oluştur
    const loan = {
      id: 'loan_' + Date.now(),
      bookId,
      userId,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverImage,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      returned: false
    };

    loans.push(loan);
    
    // Kitap müsait adedini azalt
    book.availableCopies -= 1;

    // Kullanıcının ödünç aldığı kitaplara ekle
    const user = users.find(u => u.id === userId);
    if (user) {
      user.borrowedBooks = user.borrowedBooks || [];
      user.borrowedBooks.push(bookId);
    }

    res.json({
      success: true,
      message: `"${book.title}" kitabı başarıyla ödünç alındı`,
      loan: loan,
      dueDate: loan.dueDate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ödünç alma işlemi başarısız'
    });
  }
});

// Kullanıcının ödünç aldığı kitaplar
app.get('/api/loans/my-loans', (req, res) => {
  try {
    const userId = '1';
    
    const userLoans = loans.filter(loan => loan.userId === userId && !loan.returned);
    
    res.json({
      success: true,
      data: userLoans
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ödünç alınan kitaplar yüklenemedi'
    });
  }
});

// Kitap iade etme
app.post('/api/loans/return', (req, res) => {
  try {
    const { loanId } = req.body;
    
    const loan = loans.find(loan => loan.id === loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Ödünç kaydı bulunamadı'
      });
    }

    const book = cachedBooks.find(b => b._id === loan.bookId);
    if (book) {
      book.availableCopies += 1;
    }

    // Ödünç kaydını iade edildi olarak işaretle
    loan.returned = true;
    loan.returnDate = new Date().toISOString();

    res.json({
      success: true,
      message: `"${loan.bookTitle}" kitabı başarıyla iade edildi`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İade işlemi başarısız'
    });
  }
});

// ==================== ADMIN ROUTES ====================

// Tüm ödünç işlemleri (admin)
app.get('/api/admin/loans', (req, res) => {
  try {
    res.json({
      success: true,
      data: loans,
      count: loans.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ödünç kayıtları yüklenemedi'
    });
  }
});

// İstatistikler
app.get('/api/admin/stats', (req, res) => {
  try {
    const totalBooks = cachedBooks.length;
    const totalUsers = users.length;
    const activeLoans = loans.filter(loan => !loan.returned).length;
    const totalLoans = loans.length;
    
    res.json({
      success: true,
      data: {
        totalBooks,
        totalUsers,
        activeLoans,
        totalLoans,
        availableBooks: cachedBooks.reduce((sum, book) => sum + book.availableCopies, 0)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstatistikler yüklenemedi'
    });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route bulunamadı' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Sunucu hatası!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`🎉 DIGILIBARY BACKEND ÇALIŞIYOR: http://localhost:${PORT}`);
  console.log(`📚 Google Books API entegre ediliyor...`);
  
  // Kitapları yükle (async)
  loadPopularBooks();
  
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Kitaplar: http://localhost:${PORT}/api/books`);
  console.log(`🔐 Giriş: http://localhost:${PORT}/api/auth/login`);
  console.log(`📚 Ödünç Alma: http://localhost:${PORT}/api/loans/borrow`);
  console.log(`📊 Admin Stats: http://localhost:${PORT}/api/admin/stats`);
  console.log(`=========================================`);
});