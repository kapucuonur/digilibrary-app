// netlify/functions/loans.js
import { MongoClient } from 'mongodb';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET' && event.path.includes('/my-loans')) {
    let client;
    
    try {
      const mongoUri = process.env.MONGODB_URI;
      console.log('🔗 Loans function - MongoDB URI:', mongoUri ? 'SET' : 'NOT SET');
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      // MongoDB'ye bağlan
      client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });

      console.log('🔄 Connecting to MongoDB for loans...');
      await client.connect();
      console.log('✅ Connected to MongoDB successfully!');

      const db = client.db();
      const loansCollection = db.collection('loans');

      console.log('📖 Getting user loans from database...');
      
      // Database'den gerçek data çek
      const userLoans = await loansCollection.find({ 
        userId: '1', // Şimdilik sabit user
        status: 'active' 
      }).sort({ borrowedDate: -1 }).toArray();
      
      console.log('✅ Found loans in database:', userLoans.length);

      // Format response
      const formattedLoans = userLoans.map(loan => ({
        id: loan._id.toString(),
        bookId: loan.bookId,
        bookTitle: loan.bookTitle || 'Unknown Book',
        bookCover: loan.bookCover || '/images/default-book-cover.jpg',
        borrowedDate: loan.borrowedDate,
        dueDate: loan.dueDate,
        status: loan.status
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          data: formattedLoans
        })
      };

    } catch (error) {
      console.error('❌ Loans database error:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Kitaplar yüklenirken hata: ' + error.message,
          data: [] // Hata durumunda boş array
        })
      };
    } finally {
      if (client) {
        await client.close();
        console.log('🔌 MongoDB connection closed');
      }
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Route not found' })
  };
};