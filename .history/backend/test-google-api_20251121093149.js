// Google Books API testi
async function testGoogleBooksAPI() {
    try {
        const response = await fetch(
            'https://www.googleapis.com/books/v1/volumes?q=javascript&maxResults=5'
        );
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Google Books API ÇALIŞIYOR');
            console.log(`📚 ${data.items.length} kitap bulundu`);
            console.log('📖 İlk kitap:', data.items[0].volumeInfo.title);
            return true;
        } else {
            console.log('❌ API yanıt vermedi:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ API bağlantı hatası:', error.message);
        return false;
    }
}

// Testi çalıştır
testGoogleBooksAPI();