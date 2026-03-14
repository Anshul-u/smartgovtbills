const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      currency: 'inr', // Or 'usd'
      metadata,
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe error:', error.message);
    throw new Error('Payment processing failed');
  }
};

module.exports = {
  createPaymentIntent,
};
