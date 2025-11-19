export async function handler(event, context) {
  if (event.path === '/api/auth/login') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        token: 'mock-jwt-token'
      })
    };
  }

  if (event.path === '/api/books') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: [
          { id: 1, title: 'Taras Bulba', author: 'Nikolai Gogol' },
          { id: 2, title: 'Arabian Nights', author: 'Unknown' }
        ]
      })
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Route not found' })
  };
}