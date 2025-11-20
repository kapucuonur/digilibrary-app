// netlify/functions/chatbot.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🔧 Gemini Chatbot function started');
    
    // Parse request body
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

    const { message, conversationHistory = [], language = 'tr' } = body;
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid message is required' })
      };
    }

    console.log('💬 Processing message:', message.substring(0, 50));
    console.log('🌐 Language:', language);

    // Check Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Gemini API key not configured' })
      };
    }

    console.log('🔑 Gemini API Key found');

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Model seçimi - gemini-pro ücretsiz ve hızlı
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // Dynamic system prompt based on language
    const isTurkish = language.includes('tr');
    
    const systemPrompt = isTurkish ? 
      `Sen dijital bir kütüphanenin asistanısın. Kullanıcılara kitap önerileri, ödünç alma süreçleri, kitap arama konularında yardımcı ol.

KURALLAR:
- CEVAPLARINI HER ZAMAN TÜRKÇE VER!
- Kısa ve net ol (2-3 cümle)
- Samimi ve yardımcı bir dil kullan
- Kitap isimlerini "*italic*" yap
- Asla İngilizce cevap verme!

KONULAR:
- Kitap önerileri (roman, polisiye, bilim kurgu, kişisel gelişim)
- Ödünç alma süreci
- Kitap arama yardımı
- Okuma önerileri
- Kütüphane kuralları` 
      : 
      `You are an assistant for a digital library. Help users with book recommendations, borrowing processes, and book search.

RULES:
- ALWAYS RESPOND IN ENGLISH!
- Be brief and clear (2-3 sentences)
- Use friendly and helpful language  
- Format book titles in *italic*
- Never respond in Turkish!

TOPICS:
- Book recommendations (novels, mystery, sci-fi, self-help)
- Borrowing process
- Book search assistance
- Reading suggestions
- Library rules`;

    // Conversation history'i Gemini formatına çevir
    let fullPrompt = systemPrompt + "\n\nGeçmiş konuşma:\n";
    
    if (conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Kullanıcı' : 'Asistan';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
    }
    
    fullPrompt += `\nKullanıcı: ${message}\nAsistan:`;

    console.log('🤖 Sending request to Gemini AI...');

    // Call Gemini AI
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const botResponse = response.text();

    console.log('✅ Gemini response received');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: botResponse,
        language: isTurkish ? 'tr' : 'en',
        model: "gemini-pro"
      })
    };

  } catch (error) {
    console.error('❌ GEMINI CHATBOT ERROR:', error);
    
    // Detailed error information
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
    
    console.error('🔍 Error details:', errorInfo);

    let errorMessage = 'Chatbot is temporarily unavailable';
    let userErrorMessage = 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';

    if (error.message.includes('API_KEY') || error.message.includes('API key')) {
      errorMessage = 'Gemini API key is invalid or missing';
      userErrorMessage = 'API anahtarı hatası. Lütfen sistem yöneticinize başvurun.';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      errorMessage = 'API quota exceeded';
      userErrorMessage = 'API kotası aşıldı. Lütfen daha sonra tekrar deneyin.';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: userErrorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};