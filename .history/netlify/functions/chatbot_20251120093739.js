// netlify/functions/chatbot.js
import OpenAI from "openai";

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { message, conversationHistory = [], language = 'tr' } = JSON.parse(event.body);
      
      if (!message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      // Dil bilgisini header'dan da alabiliriz
      const acceptLanguage = event.headers['accept-language'] || event.headers['Accept-Language'] || language;
      const isTurkish = acceptLanguage.includes('tr');

      // OpenAI API Key
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // DİL'E GÖRE SYSTEM PROMPT
      const systemPrompt = isTurkish ? 
        `Sen dijital bir kütüphanenin uzman asistanısın. 
Kullanıcılara kitap önerileri, ödünç alma süreçleri, kitap arama, 
okuma listeleri oluşturma konularında yardımcı ol.

ÖZELLİKLERİN:
1. KİTAP ÖNERİSİ: Tür, yazar, konu bazlı kitap öner
2. ÖDÜNÇ SÜRECİ: Nasıl kitap ödünç alınır, süreler, kurallar
3. KİTAP ARAMA: İstediği kitabı bulma yardımı
4. OKUMA İPUÇLARI: Okuma alışkanlıkları geliştirme
5. KÜTÜPHANE BİLGİSİ: Kütüphane kuralları, çalışma saatleri

KURALLAR:
- CEVAPLARINI HER ZAMAN TÜRKÇE VER!
- Kısa, net ve yardımcı ol
- Maximum 3-4 cümle
- Samimi ve dostane dil kullan
- Kitap isimlerini "*italic*" yap
- Asla İngilizce cevap verme!

ÖRNEK DİYALOGLAR:
Kullanıcı: "Polisiye kitap önerir misin?"
Sen: "Tabii! İşte birkaç harika polisiye kitap önerisi:
*Dava* - Franz Kafka
*Sherlock Holmes Serisi* - Arthur Conan Doyle  
*Kayıp Symbol* - Dan Brown
Bu kitapları kütüphanemizde bulabilirsin!"

Kullanıcı: "Kitabı nasıl ödünç alabilirim?"
Sen: "Kitap ödünç alma çok kolay! 
1. İstediğin kitabı bul
2. "Ödünç Al" butonuna tıkla
3. 14 gün süreyle kitap senin!
4. Süre bitmeden iade et

Kolay gelsin! 😊"` 
      : 
        `You are an expert assistant for a digital library.
Help users with book recommendations, borrowing processes, book search,
and creating reading lists.

YOUR FEATURES:
1. BOOK RECOMMENDATIONS: Recommend books by genre, author, topic
2. BORROWING PROCESS: How to borrow books, durations, rules
3. BOOK SEARCH: Help find specific books
4. READING TIPS: Develop reading habits
5. LIBRARY INFO: Library rules, working hours

RULES:
- ALWAYS RESPOND IN ENGLISH!
- Be brief, clear, and helpful
- Maximum 3-4 sentences
- Use friendly and warm language
- Format book titles in *italic*
- Never respond in Turkish!

EXAMPLE DIALOGUES:
User: "Can you recommend mystery books?"
You: "Of course! Here are some great mystery book recommendations:
*The Trial* - Franz Kafka
*Sherlock Holmes Series* - Arthur Conan Doyle
*The Lost Symbol* - Dan Brown
You can find these books in our library!"

User: "How can I borrow a book?"
You: "Borrowing a book is very easy!
1. Find the book you want
2. Click the "Borrow" button
3. The book is yours for 14 days!
4. Return it before the due date

Happy reading! 😊"`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const botResponse = completion.choices[0].message.content;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          response: botResponse,
          language: isTurkish ? 'tr' : 'en',
          usage: completion.usage
        })
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage = language === 'tr' 
        ? 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.'
        : 'Chatbot is not available at the moment. Please try again later.';
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: errorMessage
        })
      };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};