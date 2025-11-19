import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Basit mock data - 20 kitap
const books = [
  { _id: '1', title: 'Sefiller', author: 'Victor Hugo', category: 'Roman', availableCopies: 5, averageRating: 4.7 },
  { _id: '2', title: 'Suç ve Ceza', author: 'Dostoyevski', category: 'Roman', availableCopies: 3, averageRating: 4.8 },
  { _id: '3', title: '1984', author: 'George Orwell', category: 'Bilim Kurgu', availableCopies: 4, averageRating: 4.7 },
  { _id: '4', title: 'Küçük Prens', author: 'Saint-Exupéry', category: 'Çocuk', availableCopies: 8, averageRating: 4.9 },
  { _id: '5', title: 'Simyacı', author: 'Paulo Coelho', category: 'Roman', availableCopies: 6, averageRating: 4.5 },
  { _id: '6', title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', category: 'Roman', availableCopies: 4, averageRating: 4.8 },
  { _id: '7', title: 'İnce Memed', author: 'Yaşar Kemal', category: 'Roman', availableCopies: 5, averageRating: 4.6 },
  { _id: '8', title: 'Uçurtma Avcısı', author: 'Khaled Hosseini', category: 'Roman', availableCopies: 7, averageRating: 4.7 },
  { _id: '9', title: 'Serenad', author: 'Zülfü Livaneli', category: 'Roman', availableCopies: 2, averageRating: 4.4 },
  { _id: '10', title: 'Şeker Portakalı', author: 'José Mauro', category: 'Roman', availableCopies: 4, averageRating: 4.6 },
  { _id: '11', title: 'Hayvan Çiftliği', author: 'George Orwell', category: 'Roman', availableCopies: 7, averageRating: 4.5 },
  { _id: '12', title: 'Fareler ve İnsanlar', author: 'John Steinbeck', category: 'Roman', availableCopies: 3, averageRating: 4.7 },
  { _id: '13', title: 'Yüzüklerin Efendisi', author: 'J.R.R. Tolkien', category: 'Fantastik', availableCopies: 8, averageRating: 4.9 },
  { _id: '14', title: 'Harry Potter', author: 'J.K. Rowling', category: 'Fantastik', availableCopies: 10, averageRating: 4.8 },
  { _id: '15', title: 'Anna Karenina', author: 'Lev Tolstoy', category: 'Roman', availableCopies: 4, averageRating: 4.6 },
  { _id: '16', title: 'Madame Bovary', author: 'Gustave Flaubert', category: 'Roman', availableCopies: 2, averageRating: 4.4 },
  { _id: '17', title: 'Dönüşüm', author: 'Franz Kafka', category: 'Roman', availableCopies: 5, averageRating: 4.5 },
  { _id: '18', title: 'Bülbülü Öldürmek', author: 'Harper Lee', category: 'Roman', availableCopies: 6, averageRating: 4.7 },
  { _id: '19', title: 'Cesur Yeni Dünya', author: 'Aldous Huxley', category: 'Bilim Kurgu', availableCopies: 3, averageRating: 4.5 },
  { _id: '20', title: 'Fahrenheit 451', author: 'Ray Bradbury', category: 'Bilim Kurgu', availableCopies: 5, averageRating: 4.6 }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'DigiLibrary API çalışıyor!', 
    booksCount: books.length,
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
    return res.status(404).json({ success: false, message: 'Kitap bulunamadı' });
  }
  res.json({ success: true, data: book });
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
      token: 'digilibrary-token-123456'
    });
  } else {
    res.status(401).json({ success: false, message: 'Email veya şifre hatalı' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Tüm alanları doldurun' });
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
    token: 'digilibrary-token-' + Date.now()
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: { 
      id: '1', 
      firstName: 'Test', 
      lastName: 'Kullanıcı', 
      email: 'test@example.com',
      role: 'USER'
    }
  });
});

// Ödünç alma
app.post('/api/loans/borrow', (req, res) => {
  const { bookId } = req.body;
  const book = books.find(b => b._id === bookId);
  
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap bulunamadı' });
  }

  if (book.availableCopies < 1) {
    return res.status(400).json({ success: false, message: 'Kitap müsait değil' });
  }

  book.availableCopies -= 1;

  res.json({
    success: true,
    message: `"${book.title}" ödünç alındı`,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🎉 DIGILIBARY BACKEND ÇALIŞIYOR: http://localhost:${PORT}`);
  console.log(`📚 ${books.length} kitap hazır`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`📖 Books: http://localhost:${PORT}/api/books`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
});