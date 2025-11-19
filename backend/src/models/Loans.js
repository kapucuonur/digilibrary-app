const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'RETURNED', 'OVERDUE', 'LOST'],
    default: 'ACTIVE'
  },
  renewalCount: {
    type: Number,
    default: 0,
    max: 1 // Maximum 1 renewal allowed
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true
});

// Calculate due date (14 days from borrow date)
loanSchema.pre('save', function(next) {
  if (this.isNew) {
    const dueDate = new Date(this.borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);
    this.dueDate = dueDate;
  }
  next();
});

// Check if loan is overdue
loanSchema.methods.isOverdue = function() {
  return this.status === 'ACTIVE' && new Date() > this.dueDate;
};

// Calculate fine
loanSchema.methods.calculateFine = function() {
  if (this.isOverdue()) {
    const overdueDays = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    return overdueDays * 5; // 5 TL per day
  }
  return 0;
};

module.exports = mongoose.model('Loan', loanSchema);