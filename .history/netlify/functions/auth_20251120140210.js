// netlify/functions/auth.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectDB();
    const path = event.path.replace('/.netlify/functions/auth', '');

    // REGISTER ENDPOINT
    if (path === '/register' && event.httpMethod === 'POST') {
      const { firstName, lastName, email, password, phone } = JSON.parse(event.body);
      
      // Validation
      if (!firstName || !lastName || !email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Tüm zorunlu alanları doldurun' 
          })
        };
      }

      if (password.length < 6) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Şifre en az 6 karakter olmalı' 
          })
        };
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Bu email adresi zaten kullanılıyor' 
          })
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: 'USER'
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      };

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          user: userResponse,
          token: token
        })
      };
    }

    // LOGIN ENDPOINT
    if (path === '/login' && event.httpMethod === 'POST') {
      const { email, password } = JSON.parse(event.body);
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Email ve şifre gerekli' 
          })
        };
      }

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Geçersiz email veya şifre' 
          })
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Geçersiz email veya şifre' 
          })
        };
      }

      // Generate token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: userResponse,
          token: token
        })
      };
    }

    // GET CURRENT USER
    if (path === '/me' && event.httpMethod === 'GET') {
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Token gerekli' })
        };
      }

      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Kullanıcı bulunamadı' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(user)
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Geçersiz token' })
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Sunucu hatası',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};