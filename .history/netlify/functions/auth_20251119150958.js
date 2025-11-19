exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/auth', '');

    // LOGIN
    if (path === '/login' && event.httpMethod === 'POST') {
      const { email, password } = JSON.parse(event.body);
      
      // Mock authentication - her zaman başarılı
      const user = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: email,
        phone: '+90 555 123 4567',
        role: 'USER'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: user,
          token: 'mock-jwt-token-' + Date.now()
        })
      };
    }

    // GET CURRENT USER
    if (path === '/me' && event.httpMethod === 'GET') {
      const authHeader = event.headers.authorization;
      
      if (!authHeader) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'No token' }) };
      }

      const user = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+90 555 123 4567',
        role: 'USER'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    // REGISTER
    if (path === '/register' && event.httpMethod === 'POST') {
      const userData = JSON.parse(event.body);
      
      const user = {
        id: '2',
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: 'USER'
      };

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          user: user,
          token: 'mock-jwt-token-' + Date.now()
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};