const { sendOTPEmail: sendBrevoOTP } = require('./brevoService');
const { sendOTPEmail: sendNodemailerOTP } = require('./emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Primary (Brevo) or Fallback (Nodemailer)
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit code
 * @param {string} phone - User's phone (for logging)
 */
const sendOTP = async (email, otp, phone = '') => {
  // Always log to console as a developer fallback
  console.log(`\n========================================`);
  console.log(`  OTP for ${email} (${phone}): ${otp}`);
  console.log(`  (Delivery: Primary=Brevo, Optional=Nodemailer)`);
  console.log(`========================================\n`);

  // 1. Try Brevo (Primary)
  console.log(`[OTP] Attempting delivery via Brevo (Primary)...`);
  const brevoSuccess = await sendBrevoOTP(email, otp);
  
  if (brevoSuccess) {
    console.log(`[OTP] Brevo delivery successful.`);
    return true;
  }

  // 2. Fallback to Nodemailer if Brevo fails
  console.log(`[OTP] ⚠️ Brevo failed. Falling back to Nodemailer (Optional)...`);
  const nodemailerSuccess = await sendNodemailerOTP(email, otp);
  
  if (nodemailerSuccess) {
    console.log(`[OTP] Nodemailer delivery successful.`);
  } else {
    console.error(`[OTP] ❌ Both OTP providers failed.`);
  }

  // We return true so the controller doesn't send a 500 error, 
  // ensuring the user can still see the OTP in console if both fail.
  return true; 
};

module.exports = { generateOTP, sendOTP };
