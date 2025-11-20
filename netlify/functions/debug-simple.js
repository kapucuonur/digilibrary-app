// netlify/functions/debug-simple.js
exports.handler = async (event, context) => {
  console.log('🎯 Debug function called at:', new Date().toISOString());
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: '✅ Debug function is working perfectly!',
      timestamp: new Date().toISOString(),
      environment: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
        geminiKeyPreview: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'none'
      }
    })
  };
};