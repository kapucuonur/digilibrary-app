const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Roman', 'Bilim Kurgu', 'Fantastik', 'Biyografi', 'Tarih', 
      'Bilim', 'Teknoloji', 'Felsefe', 'Psikoloji', 'Kişisel Gelişim',
      'Çocuk', 'Gençlik', 'Şiir', 'Sanat', 'Diğer'
    ]
  },
  publishedYear: {
    type: Number,
    required: true
  },
  publisher: {
    type: String,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    default: 'Türkçe'
  },
  coverImage: {
    type: String,
    default: '/images/default-book-cover.jpg'
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 1
  },
  availableCopies: {
    type: Number,
    required: true
  },
  location: {
    shelf: String,
    row: Number,
    position: Number
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update available copies based on total copies
bookSchema.pre('save', function(next) {
  if (this.isNew) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

// Update average rating when new rating is added
bookSchema.methods.updateRating = function() {
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = total / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('Book', bookSchema);