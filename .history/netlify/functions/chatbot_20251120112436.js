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
    console.log('🚀 Gemini Chatbot function starting...');
    
    // Environment variables kontrolü
    console.log('🔍 Environment check:', {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      nodeEnv: process.env.NODE_ENV
    });

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log('✅ Request body parsed');
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
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('❌ Invalid message:', message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid message is required' })
      };
    }

    console.log('💬 Processing message:', message.substring(0, 100));
    console.log('🌐 Language:', language);

    // Check Gemini API key - DETAYLI KONTROL
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          details: 'API_KEY_MISSING'
        })
      };
    }

    if (!geminiApiKey.startsWith('AIza')) {
      console.error('❌ GEMINI_API_KEY format seems invalid');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          details: 'API_KEY_INVALID_FORMAT'
        })
      };
    }

    console.log('🔑 Gemini API Key validated');

    // Initialize Gemini AI
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      
      // Model configuration
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      // System prompt based on language
      const isTurkish = language === 'tr' || language.startsWith('tr');
      
      const systemPrompt = isTurkish ? 
        `Sen bir dijital kütüphane asistanısın. Kullanıcılara kitap önerileri, ödünç alma süreçleri ve kitap arama konularında yardımcı ol.

ÖNEMLİ KURALLAR:
- TÜM cevaplarını TÜRKÇE ver
- Kısa, net ve yardımcı ol (maksimum 3-4 cümle)
- Samimi ve profesyonel bir dil kullan
- Kitap isimlerini *italic* olarak yaz
- Asla İngilizce cevap verme

KONULAR:
- Kitap önerileri (roman, polisiye, bilim kurgu, kişisel gelişim)
- Ödünç alma süreci ve kuralları
- Kitap arama ve bulma
- Okuma önerileri
- Kütüphane işleyişi

Eğer bir konuda yeterli bilgin yoksa, kütüphane personeline yönlendir.` 
        : 
        `You are a digital library assistant. Help users with book recommendations, borrowing processes, and book search.

IMPORTANT RULES:
- ALWAYS respond in ENGLISH
- Be brief, clear and helpful (maximum 3-4 sentences)
- Use friendly and professional language
- Format book titles in *italic*
- Never respond in Turkish

TOPICS:
- Book recommendations (novels, mystery, sci-fi, self-help)
- Borrowing process and rules
- Book search and finding
- Reading suggestions
- Library operations

If you don't have enough information on a topic, direct them to library staff.`;

      // Build conversation history
      let fullPrompt = systemPrompt + "\n\nConversation History:\n";
      
      if (conversationHistory.length > 0) {
        conversationHistory.slice(-6).forEach(msg => { // Son 6 mesajı al
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          fullPrompt += `${role}: ${msg.content}\n`;
        });
      }
      
      fullPrompt += `\nUser: ${message}\nAssistant:`;

      console.log('🤖 Sending request to Gemini AI...');
      console.log('📝 Prompt length:', fullPrompt.length);

      // Call Gemini AI with timeout
      const generateContentPromise = model.generateContent(fullPrompt);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const result = await Promise.race([generateContentPromise, timeoutPromise]);
      const response = await result.response;
      const botResponse = response.text();

      console.log('✅ Gemini response received');
      console.log('📄 Response preview:', botResponse.substring(0, 100));

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

    } catch (geminiError) {
      console.error('❌ Gemini API Error:', geminiError);
      
      let userErrorMessage = 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
      let errorDetails = 'GEMINI_API_ERROR';

      if (geminiError.message.includes('API_KEY_INVALID')) {
        userErrorMessage = 'API anahtarı geçersiz. Lütfen sistem yöneticinize başvurun.';
        errorDetails = 'API_KEY_INVALID';
      } else if (geminiError.message.includes('QUOTA_EXCEEDED')) {
        userErrorMessage = 'API kotası aşıldı. Lütfen daha sonra tekrar deneyin.';
        errorDetails = 'QUOTA_EXCEEDED';
      } else if (geminiError.message.includes('PERMISSION_DENIED')) {
        userErrorMessage = 'API erişim izni reddedildi.';
        errorDetails = 'PERMISSION_DENIED';
      } else if (geminiError.message.includes('Request timeout')) {
        userErrorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        errorDetails = 'TIMEOUT';
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: userErrorMessage,
          details: errorDetails
        })
      };
    }

  } catch (error) {
    console.error('💥 UNEXPECTED ERROR:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
        details: 'UNEXPECTED_ERROR'
      })
    };
  }
};