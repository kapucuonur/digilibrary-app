import axios from 'axios';

// BURAYA KENDİ GOOGLE API ANAHTARINIZI YAPIŞTIRIN
const apiKey = "AIzaSyAHQQncjxUWuh80mhD1ucIEFOyzS1XYVXc"; 
const bookId = '074327356X';
const testUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`;

async function testApiKey() {
  try {
    console.log("⏳ Google Books API test ediliyor...");
    const response = await axios.get(testUrl);

    if (response.status === 200) {
      console.log("✅ BAŞARILI! API anahtarı çalışıyor.");
      console.log("📚 Kitap Başlığı:", response.data.volumeInfo.title);
    } else {
      console.error("❌ HATA: Beklenmeyen HTTP Durumu:", response.status);
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ API Anahtarı Hatalı/Kısıtlanmış!");
      console.error("Durum Kodu:", error.response.status);
      console.error("Hata Mesajı:", error.response.data.error.message);
    } else {
      console.error("❌ Bağlantı Hatası:", error.message);
    }
  }
}

testApiKey();