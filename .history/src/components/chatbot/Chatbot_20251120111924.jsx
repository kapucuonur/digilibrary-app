// src/components/Chatbot/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { language } = useLanguage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
  // Dil değişince chat'i sıfırla
  if (isOpen) {
    const welcomeMessage = language === 'tr' 
      ? "Merhaba! Dijital kütüphane asistanınızım. Size nasıl yardımcı olabilirim? Kitap önerisi, ödünç alma veya kitap arama konularında sorularınızı yanıtlayabilirim."
      : "Hello! I'm your digital library assistant. How can I help you? I can answer your questions about book recommendations, borrowing, or book search.";
    
    setMessages([{
      id: 1,
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      language: language
    }]);
  }
}, [language, isOpen]);

  // src/components/Chatbot/Chatbot.jsx - Güncellenmiş sendMessage fonksiyonu
// src/components/Chatbot/Chatbot.jsx - Güncellenmiş sendMessage fonksiyonu
const sendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage = {
    id: Date.now(),
    text: inputMessage,
    sender: 'user',
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    const conversationHistory = messages
      .filter(msg => msg.sender !== 'system')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

    console.log('📨 Sending request to chatbot function...');
    
    const response = await fetch('/.netlify/functions/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': language
      },
      body: JSON.stringify({
        message: inputMessage,
        conversationHistory,
        language: language
      }),
    });

    console.log('📩 Response status:', response.status);
    
    // Response'u text olarak oku ki JSON parse hatası olursa yakalayalım
    const responseText = await response.text();
    console.log('📄 Response text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      console.error('❌ API error:', data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        language: data.language
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      throw new Error(data.error || 'Unknown error from chatbot');
    }
  } catch (error) {
    console.error('💥 Chat error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    const errorMessage = {
      id: Date.now() + 1,
      text: language === 'tr' 
        ? `Üzgünüm, bir hata oluştu: ${error.message}. Lütfen daha sonra tekrar deneyin.`
        : `Sorry, an error occurred: ${error.message}. Please try again later.`,
      sender: 'bot',
      timestamp: new Date(),
      isError: true
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const texts = {
    tr: {
      placeholder: 'Mesajınızı yazın...',
      send: 'Gönder',
      clear: 'Temizle',
      minimize: 'Küçült',
      close: 'Kapat',
      title: 'Kütüphane Asistanı'
    },
    en: {
      placeholder: 'Type your message...',
      send: 'Send',
      clear: 'Clear',
      minimize: 'Minimize',
      close: 'Close',
      title: 'Library Assistant'
    }
  };

  const currentTexts = texts[language];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">{currentTexts.title}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-700 p-1 rounded"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-700 p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-xs lg:max-w-md ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              } rounded-lg px-4 py-2`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && !message.isError && (
                  <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <User className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentTexts.placeholder}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={clearChat}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {currentTexts.clear}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Powered by AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;