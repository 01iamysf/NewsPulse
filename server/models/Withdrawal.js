const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'bank_transfer'],
    required: true
  },
  paymentDetails: {
    email: String,
    bankName: String,
    accountNumber: String,
    accountHolderName: String
  },
  transactionId: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
