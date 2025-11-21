// netlify/functions/create-payment-intent.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { loanId, amount } = JSON.parse(event.body);
    
    // Payment Intent oluştur
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Kuruş cinsinden
      currency: 'try',
      metadata: { loanId },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};