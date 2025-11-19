const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let client;
  
  try {
    // Validate environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const bookId = body.bookId;
    if (!bookId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Book ID is required' })
      };
    }

    console.log('📖 Borrowing book ID:', bookId);

    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB for borrow');

    const db = client.db();
    const loansCollection = db.collection('loans');
    const booksCollection = db.collection('books');

    // 1. Get book information
    let bookTitle = 'Unknown Book';
    let bookCover = '/images/default-book-cover.jpg';
    
    try {
      // First check if book exists in our database
      const book = await booksCollection.findOne({ googleBooksId: bookId });
      if (book) {
        bookTitle = book.title;
        bookCover = book.coverImage;
        console.log('📚 Book found in database:', bookTitle);
      } else {
        // Fallback to Google Books API
        if (process.env.GOOGLE_BOOKS_API_KEY) {
          console.log('🔍 Fetching book details from Google Books API');
          const googleResponse = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
          );
          
          if (googleResponse.ok) {
            const bookData = await googleResponse.json();
            bookTitle = bookData.volumeInfo?.title || 'Unknown Book';
            bookCover = bookData.volumeInfo?.imageLinks?.thumbnail || '/images/default-book-cover.jpg';
            console.log('📚 Book details from Google API:', bookTitle);
          } else {
            console.warn('⚠️ Google Books API returned error:', googleResponse.status);
          }
        } else {
          console.warn('⚠️ GOOGLE_BOOKS_API_KEY not available');
        }
      }
    } catch (bookError) {
      console.warn('⚠️ Could not fetch book details:', bookError.message);
      // Continue with default values - don't fail the entire request
    }

    // 2. Check if book is already borrowed by this user
    const existingLoan = await loansCollection.findOne({ 
      userId: '1', 
      bookId: bookId,
      status: 'active'
    });

    if (existingLoan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `"${bookTitle}" is already borrowed by you!` 
        })
      };
    }

    // 3. Create new loan record
    const newLoan = {
      userId: '1', // 🔥 In real app, get from auth token
      bookId: bookId,
      bookTitle: bookTitle,
      bookCover: bookCover,
      borrowedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await loansCollection.insertOne(newLoan);
    console.log('✅ Loan saved to database:', result.insertedId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: `🎉 "${bookTitle}" kitabı başarıyla ödünç alındı!`,
        loanId: result.insertedId.toString(),
        dueDate: newLoan.dueDate,
        bookId: bookId,
        bookTitle: bookTitle
      })
    };

  } catch (error) {
    console.error('❌ Borrow function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Ödünç alma başarısız: ' + error.message 
      })
    };
  } finally {
    // Always close the database connection
    if (client) {
      await client.close().catch(closeError => {
        console.error('❌ Error closing MongoDB connection:', closeError);
      });
    }
  }
};