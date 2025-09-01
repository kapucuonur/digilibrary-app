# 📚 DigiLibrary - Digital Library Management System

A comprehensive full-stack digital library application featuring book borrowing, AI-powered recommendations, automated fine management with Stripe payments, and multi-language support.

![Homepage](public/screenshots/home.png)

## ✨ Features

### Core Functionality
- **📖 Book Catalog**: Browse extensive digital library with advanced search and filtering
- **📚 Borrowing System**: Seamless book checkout with automated due date tracking
- **💰 Fine Management**: Automatic calculation of overdue fines with Stripe integration
- **🤖 AI Chatbot**: Intelligent book recommendations powered by Google Gemini AI
- **👤 User Dashboard**: Comprehensive view of borrowed books, due dates, and payment history

### User Experience
- **🌍 Multi-Language Support**: Full internationalization (English & Turkish)
- **🌙 Dark Mode**: Beautiful dark theme with smooth transitions
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔐 Secure Authentication**: JWT-based auth with encrypted passwords

## 📸 Screenshots

### Homepage
![Homepage](public/screenshots/home.png)

### Search & Browse
![Search Interface](public/screenshots/search.png)

### User Profile
![User Profile](public/screenshots/profile.png)

### Payment System
![Stripe Payment](public/screenshots/payment.png)

### Reading Experience
![Reading View](public/screenshots/reading.png)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Context API** - Global state management

### Backend & Services
- **MongoDB** - NoSQL database for flexible data storage
- **Netlify Functions** - Serverless backend architecture
- **Stripe API** - Secure payment processing
- **Google Generative AI** - AI-powered chatbot
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing

## 📁 Project Structure

```
digilibrary-app/
├── backend/
│   └── src/
│       └── models/
│           ├── User.js          # User schema & authentication
│           ├── Book.js          # Book catalog schema
│           └── Loans.js         # Borrowing & fines schema
├── netlify/
│   └── functions/
│       ├── auth.js              # Login & registration
│       ├── books.js             # Book CRUD operations
│       ├── borrow.js            # Borrowing functionality
│       ├── loans.js             # Loan management
│       ├── chatbot.js           # AI recommendations
│       ├── calculate-fine.js    # Fine calculation
│       ├── create-payment-intent.js  # Stripe payment
│       ├── confirm-payment.js   # Payment confirmation
│       └── check-overdue-loans.js    # Scheduled checker
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Navigation with theme toggle
│   │   │   └── Footer.jsx       # Footer component
│   │   ├── common/
│   │   │   ├── BookCard.jsx     # Book display card
│   │   │   └── LoadingSpinner.jsx
│   │   ├── Chatbot/
│   │   │   └── Chatbot.jsx      # AI chat interface
│   │   └── PaymentModal.jsx     # Stripe payment modal
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── ThemeContext.jsx     # Dark mode state
│   │   └── LanguageContext.jsx  # i18n state
│   ├── pages/
│   │   ├── Home.jsx             # Landing page
│   │   ├── Books.jsx            # Book catalog
│   │   ├── BookDetail.jsx       # Individual book view
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── Profile.jsx          # User profile
│   │   ├── Login.jsx            # Login page
│   │   └── Register.jsx         # Registration page
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/
│   └── screenshots/             # Application screenshots
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16.x or higher
- **MongoDB** account (MongoDB Atlas recommended)
- **Stripe** account for payment processing
- **Google AI** API key for chatbot functionality

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kapucuonur/digilibrary-app.git
cd digilibrary-app
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install serverless function dependencies**
```bash
cd netlify/functions
npm install
cd ../..
```

4. **Environment Configuration**

Create a `.env` file in the root directory:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Google AI Configuration
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digilibrary

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here

# Application Configuration
VITE_API_URL=/.netlify/functions
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Deployment

**Deploy to Netlify:**

1. Connect your GitHub repository to Netlify
2. Configure environment variables in Netlify dashboard
3. Deploy with automatic builds on push

```bash
# Or deploy via Netlify CLI
netlify deploy --prod
```

## 🔑 Key Features Explained

### Serverless Architecture
All backend logic runs on Netlify Functions, providing:
- **Scalability**: Auto-scaling based on demand
- **Cost-Effective**: Pay only for actual usage
- **No Server Management**: Focus on code, not infrastructure

### AI-Powered Recommendations
The chatbot uses Google's Gemini AI to:
- Understand user preferences
- Recommend relevant books
- Answer questions about the library
- Provide personalized reading suggestions

### Automated Fine System
- Calculates fines based on overdue days
- Sends automated reminders
- Integrates with Stripe for secure payments
- Updates loan status automatically after payment

### Multi-Language Support
- Dynamic language switching
- Persistent language preference
- Full translation coverage
- Easy to add new languages

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login
- `GET /auth/verify` - Verify JWT token

### Book Endpoints
- `GET /books` - Get all books (with pagination)
- `GET /books/:id` - Get single book details
- `POST /books` - Add new book (admin only)
- `PUT /books/:id` - Update book (admin only)
- `DELETE /books/:id` - Delete book (admin only)

### Loan Endpoints
- `POST /borrow` - Borrow a book
- `GET /loans/user/:userId` - Get user's loans
- `PUT /loans/:id/return` - Return a book
- `GET /loans/:id/fine` - Calculate fine

### Payment Endpoints
- `POST /create-payment-intent` - Create Stripe payment
- `POST /confirm-payment` - Confirm payment
- `POST /mark-fine-as-paid` - Update loan after payment

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Onur Kapucu**
- GitHub: [@kapucuonur](https://github.com/kapucuonur)
- Email: kapucuonur@hotmail.com

## 🙏 Acknowledgments

- **Google Generative AI** for powering the intelligent chatbot
- **Stripe** for secure payment processing
- **MongoDB** for flexible data storage
- **Netlify** for seamless deployment and serverless functions
- **React** and **Vite** communities for excellent tools

## 📞 Support

For support, email kapucuonur@hotmail.com or open an issue on GitHub.

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by Onur Kapucu
