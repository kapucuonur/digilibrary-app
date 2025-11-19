import express from 'express';
import cors from 'cors';
import axios from 'axios'; // Google Books API için ekle

const app = express();
app.use(cors());
app.use(express.json());

// Google Books API Key - Kendi key'ini buraya yaz
const GOOGLE_BOOKS_API_KEY = 'AIzaSyAHQQncjxUWuh80mhD1ucIEFOyzS1XYVXc';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Google Books'tan kitap arama
const searchGoogleBooks = async (query, maxResults = 20) => {
  try {
    const response = await axios.get(GOOGLE_BOOKS_API_URL, {
      params: {
        q: query,
        maxResults: maxResults,
        key: GOOGLE_BOOKS_API_KEY,
        langRestrict: 'tr' // Türkçe kitaplar için
      }
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Google Books API hatası:', error);
    return [];
  }
};

// Google Books verisini formatla
const formatBookData = (googleBook) => {
  const volumeInfo = googleBook.volumeInfo;
  const id = googleBook.id;
  
  return {
    _id: id,
    title: volumeInfo.title || 'Başlık Yok',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Yazar Yok',
    category: volumeInfo.categories ? volumeInfo.categories[0] : 'Genel',
    description: volumeInfo.description || 'Açıklama yok',
    coverImage: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : '/images/default-book-cover.jpg',
    publishedYear: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : 2024,
    publisher: volumeInfo.publisher || 'Bilinmiyor',
    pageCount: volumeInfo.pageCount || 0,
    isbn: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers[0].identifier : 'ISBN Yok',
    language: volumeInfo.language || 'tr',
    availableCopies: Math.floor(Math.random() * 5) + 1, // Random 1-5 arası
    totalCopies: 5,
    averageRating: volumeInfo.averageRating || (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 arası
    totalRatings: volumeInfo.ratingsCount || Math.floor(Math.random() * 100)
  };
};

// Önceden yüklenmiş kitaplar (cache)
let cachedBooks = [];

// Popüler kitapları yükle (başlangıçta)
const loadPopularBooks = async () => {
  try {
    console.log('📚 Google Books\'tan kitaplar yükleniyor...');
    
    // Popüler Türkçe kitaplar için arama terimleri
    const searchQueries = [
      'subject:fiction',
      'subject:classics', 
      'subject:romance',
      'subject:science fiction',
      'subject:history',
      'intitle:Orhan Pamuk',
      'intitle:Elif Şafak',
      'intitle:Yaşar Kemal'
    ];
    
    let allBooks = [];
    
    // Her arama teriminden 5 kitap al
    for (const query of searchQueries) {
      const books = await searchGoogleBooks(query, 5);
      const formattedBooks = books.map(formatBookData);
      allBooks = [...allBooks, ...formattedBooks];
      
      // Biraz bekle (API rate limit için)
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Benzersiz kitaplar (ID'ye göre)
    const uniqueBooks = allBooks.filter((book, index, self) => 
      index === self.findIndex(b => b._id === book._id)
    );
    
    cachedBooks = uniqueBooks.slice(0, 30); // İlk 30 kitap
    console.log(`✅ ${cachedBooks.length} kitap Google Books'tan yüklendi`);
    
  } catch (error) {
    console.error('❌ Kitaplar yüklenemedi, mock data kullanılıyor:', error);
    // Hata durumunda mock data kullan
    cachedBooks = getMockBooks();
  }
};

// Mock data (fallback)
const getMockBooks = () => [
  {
    _id: '1', title: 'Sefiller', author: 'Victor Hugo', category: 'Roman',
    description: 'Fransa tarihini arka plan alan insanlık dramı',
    coverImage: '/images/default-book-cover.jpg', publishedYear: 1862,
    availableCopies: 5, averageRating: 4.7
  },
  {
    _id: '2', title: 'Suç ve Ceza', author: 'Fyodor Dostoyevski', category: 'Roman', 
    description: 'Raskolnikov\'un psikolojik çöküşünün hikayesi',
    coverImage: '/images/default-book-cover.jpg', publishedYear: 1866,
    availableCopies: 3, averageRating: 4.8
  },
  {
    _id: '3', title: '1984', author: 'George Orwell', category: 'Bilim Kurgu',
    description: 'Distopik bir gelecek vizyonu',
    coverImage: '/images/default-book-cover.jpg', publishedYear: 1949,
    availableCopies: 4, averageRating: 4.7
  },
  {
    _id: '4', title: 'Küçük Prens', author: 'Antoine de Saint-Exupéry', category: 'Çocuk',
    description: 'Felsefi bir çocuk klasiği',
    coverImage: '/images/default-book-cover.jpg', publishedYear: 1943,
    availableCopies: 8, averageRating: 4.9
  },
  {
    _id: '5', title: 'Hayvan Çiftliği', author: 'George Orwell', category: 'Roman',
    description: 'Distopik bir siyasi hiciv',
    coverImage: '/images/default-book-cover.jpg', publishedYear: 1945,
    availableCopies: 7, averageRating: 4.6
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiLibrary API çalışıyor!',
    booksCount: cachedBooks.length,
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
        // Yeni kitabı cached'e ekle
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

// Diğer endpoint'ler (auth vs.) aynı kalacak...
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

// Sunucu başlangıcında kitapları yükle
const PORT = 5001;
app.listen(PORT, async () => {
  console.log(`🎉 DIGILIBARY BACKEND ÇALIŞIYOR: http://localhost:${PORT}`);
  console.log(`📚 Google Books API entegre ediliyor...`);
  
  // Kitapları yükle (async - blocking yapmaz)
  loadPopularBooks();
  
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`📖 Books: http://localhost:${PORT}/api/books`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/books/search/google`);
  console.log(`📚 Categories: http://localhost:${PORT}/api/categories`);
});