// netlify/functions/mark-fine-as-paid.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;        // Netlify'e ekleyeceğiz
const DB_NAME = 'digilibrary';                      // senin veritabanı adı
const COLLECTION_NAME = 'loans';                    // loan kayıtlarının olduğu collection

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  
  cachedClient = client;
  cachedDb = db;
  return db;
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { loanId, paymentIntentId, amount } = JSON.parse(event.body);

    const db = await connectToDatabase();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { id: loanId },
      {
        $set: {
          finePaid: true,
          fineAmount: 0,
          paidAt: new Date(),
          paymentIntentId: paymentIntentId,
          paidAmount: amount
        }
      }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Loan bulunamadı' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Ceza ödendi ve kapatıldı' })
    };

  } catch (error) {
    console.error('MongoDB Hatası:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Sunucu hatası', details: error.message })
    };
  }
};