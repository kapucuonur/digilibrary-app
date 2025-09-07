// netlify/functions/confirm-payment.js
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { paymentIntentId, loanId } = JSON.parse(event.body);
    
    // Stripe'dan ödeme durumunu kontrol et
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Ödeme başarısız' 
        })
      };
    }
    
    // MongoDB'de loan'ı güncelle
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const loans = db.collection('loans');
    
    await loans.updateOne(
      { _id: new ObjectId(loanId) },
      {
        $set: { 
          status: 'FINE_PAID',
          paidAmount: paymentIntent.amount / 100,
          updatedAt: new Date()
        },
        $push: {
          paymentHistory: {
            paymentId: paymentIntentId,
            amount: paymentIntent.amount / 100,
            date: new Date(),
            status: 'succeeded'
          }
        }
      }
    );
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Ödeme başarıyla tamamlandı!'
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