// netlify/functions/calculate-fine.js
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { loanId } = JSON.parse(event.body);
    
    // MongoDB'den loan'ı getir
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    const loans = db.collection('loans');
    
    const loan = await loans.findOne({ _id: new ObjectId(loanId) });
    
    if (!loan) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Loan not found' })
      };
    }
    
    // Ceza hesapla (günlük 1₺)
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    const fineDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
    const fineAmount = fineDays * 1; // Günlük 1 TL
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        fineDays,
        fineAmount,
        dueDate: loan.dueDate,
        bookTitle: loan.bookTitle
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};