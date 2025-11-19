import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
const books = [
  { id: 1, title: 'Sefiller', author: 'Victor Hugo', category: 'Roman' },
  { id: 2, title: 'Suç ve Ceza', author: 'Dostoyevski', category: 'Roman' },
  { id: 3, title: '1984', author: 'George Orwell', category: 'Bilim Kurgu' }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server çalışıyor!' });
});

app.get('/api/books', (req, res) => {
  res.json({ books });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'test@example.com' && password === '123456') {
    res.json({ success: true, user: { name: 'Test User' }, token: 'test-token' });
  } else {
    res.status(401).json({ success: false, message: 'Hatalı giriş' });
  }
});

// 5001 PORT KULLAN - BU KESİN
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🎉 BACKEND ÇALIŞIYOR: http://localhost:${PORT}`);
  console.log(`📚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📖 Books: http://localhost:${PORT}/api/books`);
});