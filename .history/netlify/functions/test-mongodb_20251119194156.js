// netlify/functions/test-db.js
import { MongoClient } from 'mongodb';

export const handler = async (event, context) => {
  let client;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'MONGODB_URI is not set in environment variables',
          envVars: Object.keys(process.env)
        })
      };
    }

    console.log('Testing MongoDB connection with URI:', mongoUri.substring(0, 50) + '...');

    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect();
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Loans collection'daki doküman sayısı
    const loansCount = await db.collection('loans').countDocuments();
    const booksCount = await db.collection('books').countDocuments();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'MongoDB connection successful!',
        database: db.databaseName,
        collections: collectionNames,
        counts: {
          loans: loansCount,
          books: booksCount
        },
        connectionString: mongoUri.substring(0, 30) + '...' // Güvenlik için kısmi göster
      })
    };

  } catch (error) {
    console.error('MongoDB Test Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'MongoDB connection failed',
        details: error.message,
        errorName: error.name,
        errorCode: error.code
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};