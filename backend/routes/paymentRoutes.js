const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  generateReceipt,
} = require('../controllers/paymentController');

// Unified Order Creation (Razorpay)
router.post('/create-order', protect, createOrder);

// Verify Payment
router.post('/verify', protect, verifyPayment);

// History & Receipt
router.get('/history', protect, getPaymentHistory);
router.get('/receipt/:transactionId', protect, generateReceipt);

module.exports = router;
