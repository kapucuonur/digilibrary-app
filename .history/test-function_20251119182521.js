// test-function.js
const { handler } = require('./netlify/functions/borrow');

// Mock event object
const mockEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({ bookId: 'x_zOCwAAQBAJ' })
};

// Mock context
const mockContext = {};

// Test the function directly
async function testBorrow() {
  try {
    console.log('🧪 Testing borrow function...');
    const result = await handler(mockEvent, mockContext);
    console.log('✅ Function executed successfully');
    console.log('Status Code:', result.statusCode);
    console.log('Response Body:', result.body);
  } catch (error) {
    console.error('❌ Function failed:', error);
  }
}

testBorrow();