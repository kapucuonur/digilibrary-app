// netlify/functions/chatbot.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
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
    console.log('📦 Environment variables check:', {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log('📨 Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { message, conversationHistory = [], language = 'tr' } = body;
    
    // Validate input
    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message:', message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid message is required' })
      };
    }

    console.log('💬 Processing message:', message.substring(0, 50));
    console.log('🌐 Language:', language);
    console.log('📚 Conversation history length:', conversationHistory.length);

    // Check Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY is not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          details: 'API key not configured'
        })
      };
    }

    console.log('🔑 Gemini API Key found, length:', geminiApiKey.length);

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
- Asla İngilizce cevap verme!` 
      : 
      `You are an assistant for a digital library. Help users with book recommendations, borrowing processes, and book search.

RULES:
- ALWAYS RESPOND IN ENGLISH!
- Be brief and clear (2-3 sentences)
- Use friendly and helpful language  
- Format book titles in *italic*
- Never respond in Turkish!`;

    // Conversation history'i Gemini formatına çevir
    let fullPrompt = systemPrompt + "\n\nGeçmiş konuşma:\n";
    
    if (conversationHistory.length > 0) {
      conversationHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'Kullanıcı' : 'Asistan';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
    }
    
    fullPrompt += `\nKullanıcı: ${message}\nAsistan:`;

    console.log('🤖 Sending request to Gemini AI...');
    console.log('📝 Prompt length:', fullPrompt.length);

    // Call Gemini AI
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const botResponse = response.text();

    console.log('✅ Gemini response received:', botResponse.substring(0, 100));

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
    console.error('🔍 Error name:', error.name);
    console.error('🔍 Error message:', error.message);
    
    // Google AI API specific errors
    let userErrorMessage = 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid')) {
      userErrorMessage = 'API anahtarı geçersiz. Lütfen sistem yöneticinize başvurun.';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      userErrorMessage = 'API kotası aşıldı. Lütfen daha sonra tekrar deneyin.';
    } else if (error.message.includes('PERMISSION_DENIED')) {
      userErrorMessage = 'API erişim izni reddedildi.';
    } else if (error.message.includes('MODEL_NOT_FOUND')) {
      userErrorMessage = 'Chat modeli bulunamadı.';
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: userErrorMessage,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};