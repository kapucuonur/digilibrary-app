import Stripe from 'stripe';

// STRIPE_SECRET_KEY gizli tutulmalıdır ve sadece backend/sunucu ortamında kullanılır.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Gerekli CORS başlıkları
const HEADERS = {
  'Access-Control-Allow-Origin': '*', // Tüm origin'lere izin ver (Gerekiyorsa kısıtlayın!)
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Netlify Sunucusuz Fonksiyonu: Stripe Payment Intent oluşturur.
 */
export const handler = async (event) => {
  // CORS Pre-flight isteği yanıtı
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { loanId, amount, bookTitle, fineDays } = JSON.parse(event.body);

    // Giriş Doğrulama (Input Validation)
    if (!loanId) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'loanId parametresi eksik.' })
      };
    }
    
    // Miktar kontrolü: Pozitif sayı olmalı
    const amountInTL = parseFloat(amount);
    if (isNaN(amountInTL) || amountInTL <= 0) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Geçerli bir ödeme miktarı (amount) gereklidir.' })
      };
    }

    // Payment Intent oluşturma
    // Stripe API, miktarı küçük para birimi cinsinden (kuruş) bekler.
    const amountInCents = Math.round(amountInTL * 100); 

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, 
      currency: 'try', // Türk Lirası
      metadata: { 
        loanId,
        bookTitle: bookTitle || 'Bilinmeyen Kitap',
        fineDays: fineDays || 0
      },
      // Otomatik ödeme yöntemlerini etkinleştir
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Gecikme Cezası: ${bookTitle || 'Bilinmeyen Kitap'} (${fineDays} gün)`
    });

    console.log(`✅ Payment intent oluşturuldu: ${paymentIntent.id}`);

    // Frontend'e clientSecret ve intent ID'yi döndür
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };
  } catch (error) {
    console.error('❌ Stripe/Sunucu Hatası:', error);
    
    // Genel hata yanıtı
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ 
        error: error.message || 'Sunucu hatası: Ödeme işlemi başlatılamadı.'
      })
    };
  }
};