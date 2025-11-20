// netlify/functions/chatbot.js
import OpenAI from "openai";

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { message, conversationHistory = [] } = JSON.parse(event.body);
      
      if (!message) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Message is required' })
        };
      }

      // OpenAI API Key - Netlify Environment Variables'dan al
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Kütüphane odaklı system prompt
      const systemPrompt = `Sen dijital bir kütüphanenin asistanısın. 
      Kullanıcılara kitap önerileri, ödünç alma süreçleri, kitap arama, 
      okuma listeleri oluşturma konularında yardımcı ol.

      CEVAPLARINI TÜRKÇE VER!

      Görevlerin:
      1. Kitap önerileri yap
      2. Ödünç alma sürecini açıkla
      3. Kitap arama yardımı
      4. Okuma ipuçları ver
      5. Kütüphane kurallarını açıkla

      Kısa ve net cevaplar ver.`;

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
          usage: completion.usage
        })
      };

    } catch (error) {
      console.error('Chatbot error:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Chatbot is not available at the moment. Please try again later.'
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