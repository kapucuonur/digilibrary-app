// netlify/functions/test-mongodb.js
import { MongoClient } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let client;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'MONGODB_URI not found in environment variables' })
      };
    }

    console.log('Testing MongoDB connection...');
    
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    
    // Database ve collection'ları kontrol et
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('Available collections:', collectionNames);
    
    // Loans collection'daki doküman sayısı
    const loansCount = await db.collection('loans').countDocuments();
    const booksCount = await db.collection('books').countDocuments();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'MongoDB connection successful!',
        database: db.databaseName,
        collections: collectionNames,
        counts: {
          loans: loansCount,
          books: booksCount
        }
      })
    };

  } catch (error) {
    console.error('MongoDB Test Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'MongoDB connection failed',
        details: error.message,
        mongoUri: process.env.MONGODB_URI ? 'MONGODB_URI is set' : 'MONGODB_URI is NOT set'
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};