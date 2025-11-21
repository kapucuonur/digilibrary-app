const { MongoClient } = require('mongodb');

// Senin connection string'in
const uri = "mongodb+srv://digilibrary:Library123@trihonorcluster.dq8qfba.mongodb.net/digilibrary?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    console.log("⏳ Bağlanmaya çalışılıyor...");
    await client.connect();
    console.log("✅ BAŞARILI! Veritabanına bağlandı.");
    
    // Veritabanı ismini kontrol et
    const db = client.db("digilibrary");
    console.log(`📂 Seçilen veritabanı: ${db.databaseName}`);
    
    // Koleksiyonları listele
    const collections = await db.listCollections().toArray();
    console.log("📚 Koleksiyonlar:", collections.map(c => c.name));

  } catch (err) {
    console.error("❌ HATA OLUŞTU:");
    console.error(err.message);
  } finally {
    await client.close();
  }
}

run();