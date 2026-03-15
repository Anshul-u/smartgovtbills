require('dotenv').config();
const { sendOTP } = require('./services/otpService');

const email = 'anshulupwanshi007@gmail.com';
const otp = '112233';

async function finalOtpCheck() {
  console.log(`[Final Check] Triggering OTP delivery for ${email}...`);
  const success = await sendOTP(email, otp);
  if (success) {
    console.log('[Final Check] ✅ OTP Service process finished.');
  } else {
    console.log('[Final Check] ❌ OTP Service failed.');
  }
}

finalOtpCheck();
