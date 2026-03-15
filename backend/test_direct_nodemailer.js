require('dotenv').config();
const { sendOTPEmail } = require('./services/emailService');

const email = 'anshulupwanshi007@gmail.com';
const otp = '777666';

async function testNodemailerDirect() {
  console.log(`[Direct Test] Sending OTP ${otp} to ${email} via Nodemailer ONLY...`);
  const success = await sendOTPEmail(email, otp);
  if (success) {
    console.log('[Direct Test] ✅ Nodemailer says sent. Please check your inbox (and SPAM).');
  } else {
    console.log('[Direct Test] ❌ Nodemailer failed.');
  }
}

testNodemailerDirect();
