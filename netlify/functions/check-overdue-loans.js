// netlify/functions/check-overdue-loans.js
// Bu function'ı cron job olarak çalıştır
export const handler = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const loans = db.collection('loans');
    
    const today = new Date();
    
    // Geciken kitapları bul
    const overdueLoans = await loans.find({
      status: 'ACTIVE',
      dueDate: { $lt: today }
    }).toArray();
    
    // Ceza hesapla ve güncelle
    for (const loan of overdueLoans) {
      const fineDays = Math.ceil((today - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
      const fineAmount = fineDays * 1;
      
      await loans.updateOne(
        { _id: loan._id },
        {
          $set: {
            status: 'OVERDUE',
            fineDays,
            fineAmount,
            updatedAt: new Date()
          }
        }
      );
      
      console.log(`Updated fine for loan ${loan._id}: ${fineAmount} ₺`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: overdueLoans.length,
        message: 'Overdue loans updated successfully'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await client.close();
  }
};