const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initializing Razorpay instance with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Create a Razorpay Order
 * @param {number} amount - Amount in INR
 * @param {string} receipt - Unique receipt ID (billId)
 */
const createOrder = async (amount, receipt) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('[Razorpay] ERROR: API Keys are missing in .env');
    throw new Error('Razorpay API keys are not configured on the server.');
  }

  try {
    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: 'INR',
      receipt: String(receipt),
    };

    console.log(`[Razorpay] Attempting to create order:`, JSON.stringify(options));
    const order = await razorpay.orders.create(options);
    console.log(`[Razorpay] Order created successfully: ${order.id}`);
    return order;
  } catch (error) {
    console.error('[Razorpay] Create Order Error Details:', JSON.stringify(error));
    const errorMessage = error.description || error.message || 'Razorpay API rejected the order';
    throw new Error(errorMessage);
  }
};

/**
 * Verify Razorpay Signature
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 */
const verifySignature = (orderId, paymentId, signature) => {
  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest('hex');
    const isMatched = generatedSignature === signature;
    console.log(`[Razorpay] Signature verification: ${isMatched ? 'SUCCESS' : 'FAILED'}`);
    return isMatched;
  } catch (error) {
    console.error('[Razorpay] Signature Verification Error:', error);
    return false;
  }
};

module.exports = {
  createOrder,
  verifySignature,
};
