const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  initiatePhonePePayment,
  checkPhonePeStatus,
  getPaymentHistory,
  generateReceipt,
} = require('../controllers/paymentController');

// Redirect Flow
router.post('/initiate', protect, initiatePhonePePayment);
router.get('/status/:transactionId', protect, checkPhonePeStatus);

// History & Receipt
router.get('/history', protect, getPaymentHistory);
router.get('/receipt/:transactionId', protect, generateReceipt);

// Compatibility alias for existing frontend if needed
router.post('/create-order', protect, initiatePhonePePayment);

module.exports = router;
