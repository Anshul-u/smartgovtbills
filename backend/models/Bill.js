const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  billType: {
    type: String,
    enum: ['property', 'electricity', 'water'],
    required: true,
  },
  consumerNumber: {
    type: String, // Dynamic depending on the type
    required: true,
  },
  billingPeriod: {
    month: { type: Number },
    year: { type: Number },
  },
  baseAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  calculationDetails: {
    type: Object, // Store specific calculation stats (e.g., units consumed)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Bill', BillSchema);
