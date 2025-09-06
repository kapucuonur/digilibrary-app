// netlify/functions/chatbot.js
const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('🚀 Yeni Gemini API ile başlıyor...');
    
    const body = JSON.parse(event.body);
    const { message, conversationHistory = [], language = 'tr' } = body;

    if (!message?.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Geçerli mesaj gerekli' })
      };
    }

    // API Key kontrolü
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY bulunamadı');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
          details: 'API_KEY_MISSING'
        })
      };
    }

    console.log('🔑 API Key doğrulandı');

    // Yeni GoogleGenAI ile başlat
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Sistem talimatları
    const systemInstruction = language === 'tr' ? 
      "Sen bir dijital kütüphane asistanısın. Kullanıcılara kitap önerileri, ödünç alma süreçleri ve kitap arama konularında yardımcı ol. TÜM cevaplarını TÜRKÇE ver. Kısa, net ve yardımcı ol (2-3 cümle). Samimi ve profesyonel bir dil kullan. Kitap isimlerini *italic* yap. Asla İngilizce cevap verme!"
      : 
      "You are a digital library assistant. Help users with book recommendations, borrowing processes, and book search. ALWAYS respond in ENGLISH. Be brief, clear and helpful (2-3 sentences). Use friendly and professional language. Format book titles in *italic*. Never respond in Turkish!";

    // Konuşma geçmişini oluştur
    const contents = [];
    
    // Sistem talimatını ekle
    contents.push(systemInstruction);
    
    // Konuşma geçmişini ekle
    if (conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        contents.push(msg.role === 'user' ? `Kullanıcı: ${msg.content}` : `Asistan: ${msg.content}`);
      });
    }
    
    // Son mesajı ekle
    contents.push(`Kullanıcı: ${message}`);

    console.log('🤖 Gemini API çağrısı yapılıyor...');

    // Yeni API ile içerik oluştur
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // veya "gemini-2.5-flash"
      contents: contents.join('\n'),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const botResponse = response.text;
    console.log('✅ Başarılı yanıt alındı');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: botResponse,
        language: language,
        model: "gemini-2.0-flash"
      })
    };

  } catch (error) {
    console.error('❌ Gemini API Hatası:', error);
    
    let userErrorMessage = 'Chatbot şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    let errorDetails = 'GEMINI_API_ERROR';

    if (error.message?.includes('API_KEY') || error.message?.includes('401')) {
      userErrorMessage = 'API anahtarı geçersiz. Lütfen sistem yöneticinize başvurun.';
      errorDetails = 'API_KEY_INVALID';
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      userErrorMessage = 'API kotası aşıldı. Lütfen daha sonra tekrar deneyin.';
      errorDetails = 'QUOTA_EXCEEDED';
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
};