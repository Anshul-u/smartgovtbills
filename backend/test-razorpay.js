require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const test = async () => {
  console.log('Testing Razorpay with Key ID:', process.env.RAZORPAY_KEY_ID);
  try {
    const order = await razorpay.orders.create({
      amount: 50000, // 500 INR
      currency: 'INR',
      receipt: 'test_receipt_1'
    });
    console.log('Order created successfully:', order.id);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

test();
