// netlify/functions/create-payment-intent.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS' // ⬅️ EKLENDİ
  };

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Sadece POST methoduna izin ver
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('🔄 Payment intent oluşturuluyor...');
    
    const { loanId, amount, bookTitle, fineDays } = JSON.parse(event.body);
    
    // Input validation
    if (!loanId || !amount || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Geçersiz loanId veya amount' })
      };
    }

    console.log('💳 Payment intent için:', { loanId, amount, bookTitle, fineDays });

    // Payment Intent oluştur
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Kuruş cinsinden
      currency: 'try',
      metadata: { 
        loanId,
        bookTitle: bookTitle || 'Bilinmeyen Kitap',
        fineDays: fineDays || 0
      },
      description: `Gecikme cezası - ${bookTitle || 'Kitap'}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment intent oluşturuldu:', paymentIntent.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount
      })
    };
  } catch (error) {
    console.error('❌ Stripe hatası:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Ödeme işlemi başlatılamadı' 
      })
    };
  }
};