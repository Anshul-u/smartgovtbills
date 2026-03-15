const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay Order
 * @param {number} amount - Amount in INR
 * @param {string} receipt - Unique receipt ID
 */
const createOrder = async (amount, receipt) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: receipt,
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('[Razorpay] Create Order Error:', error);
    throw new Error('Failed to create Razorpay order');
  }
};

/**
 * Verify Razorpay Signature
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 */
const verifySignature = (orderId, paymentId, signature) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

module.exports = {
  createOrder,
  verifySignature,
};
