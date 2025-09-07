// netlify/functions/create-payment-intent.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body);

    const { loanId, amount, currency = 'try', bookTitle, fineDays } = payload;

    // Zorunlu alan kontrolü
    if (!loanId || !amount) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'loanId ve amount zorunludur.' })
      };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Geçerli bir ödeme miktarı gerekli.' })
      };
    }

    // Currency kontrolü ve dönüşüm (Stripe küçük harf bekler)
    const validCurrencies = ['try', 'eur'];
    const stripeCurrency = currency.toLowerCase();
    
    if (!validCurrencies.includes(stripeCurrency)) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ 
          error: `Desteklenmeyen para birimi: ${currency}. Sadece 'try' veya 'eur' kabul edilir.` 
        })
      };
    }

    // Miktarı kuruş/cent'e çevir
    const amountInCents = Math.round(amountNum * 100);

    // Payment Intent oluştur
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: stripeCurrency, // Artık dinamik: try veya eur
      metadata: {
        loanId,
        bookTitle: bookTitle || 'Bilinmeyen Kitap',
        fineDays: fineDays?.toString() || '0',
        currency: stripeCurrency.toUpperCase()
      },
      description: `Gecikme Cezası - ${bookTitle || 'Kitap'} (${fineDays || 0} gün)`,
      automatic_payment_methods: { enabled: true },
    });

    console.log(`PaymentIntent oluşturuldu: ${paymentIntent.id} | ${amountInCents} ${stripeCurrency.toUpperCase()}`);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };

  } catch (error) {
    console.error('Stripe Hatası:', error);

    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        error: error.message || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.'
      })
    };
  }
};