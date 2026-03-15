require('dotenv').config();
const { sendOTPEmail } = require('./services/emailService');

const email = process.env.EMAIL_USER || 'anshulupwanshi007@gmail.com';
const otp = '999999';

async function testOtp() {
  console.log(`[Test] Attempting to send OTP to ${email} using Nodemailer...`);
  const success = await sendOTPEmail(email, otp);
  if (success) {
    console.log('[Test] ✅ OTP Sent Successfully!');
  } else {
    console.log('[Test] ❌ OTP Sending Failed.');
  }
}

testOtp();
