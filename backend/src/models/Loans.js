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
    max: 1
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date, // Ödeme tarihi (isteğe bağlı ama güzel olur)
  
  // YENİ: Ceza hangi para biriminde?
  fineCurrency: {
    type: String,
    enum: ['TRY', 'EUR'],
    default: 'TRY' // Varsayılan TL
  },

  notes: String
}, {
  timestamps: true
});

// Due date otomatik 14 gün
loanSchema.pre('save', function(next) {
  if (this.isNew && !this.dueDate) {
    const due = new Date(this.borrowDate);
    due.setDate(due.getDate() + 14);
    this.dueDate = due;
  }
  next();
});

// Gecikme kontrolü
loanSchema.methods.isOverdue = function() {
  return this.status === 'ACTIVE' && new Date() > this.dueDate;
};

// Ceza hesaplama — artık currency'ye göre!
loanSchema.methods.calculateFine = function() {
  if (!this.isOverdue()) return 0;

  const overdueDays = Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
  
  // Günlük ceza miktarı (para birimine göre)
  const dailyFine = this.fineCurrency === 'EUR' ? 0.50 : 5.00; // 0.50€ veya 5₺

  return Math.round(overdueDays * dailyFine * 100) / 100; // 2 ondalık
};

// Bonus: Fine'ı güncelle ve kaydet (kullanışlı metod)
loanSchema.methods.updateFine = async function() {
  const fine = this.calculateFine();
  this.fineAmount = fine;
  
  // Eğer ceza sıfır ise, ödenmiş sayalım (opsiyonel)
  if (fine === 0) {
    this.finePaid = true;
    this.fineCurrency = 'TRY'; // sıfır cezada önemli değil
  }

  await this.save();
};

module.exports = mongoose.model('Loan', loanSchema);