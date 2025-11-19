// netlify/functions/auth.js
exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  try {
    const path = event.path.replace("/.netlify/functions/auth", "");
    if (path === "/login" && event.httpMethod === "POST") {
      const { email, password } = JSON.parse(event.body);
      const user = {
        id: "1",
        firstName: "Test",
        lastName: "User",
        email,
        role: "USER"
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user,
          token: "mock-jwt-token"
        })
      };
    }
    if (path === "/me" && event.httpMethod === "GET") {
      const user = {
        id: "1",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        role: "USER"
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
//# sourceMappingURL=auth.js.map
