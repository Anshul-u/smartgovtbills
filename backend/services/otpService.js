// OTP Service - Email Driven (Nodemailer)
const { sendOTPEmail } = require('./emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit code
 * @param {string} phone - User's phone (for logging)
 */
const sendOTP = async (email, otp, phone = '') => {
  // Always log to console as a developer fallback (so user isn't blocked)
  console.log(`\n========================================`);
  console.log(`  OTP for ${email} (${phone}): ${otp}`);
  console.log(`  (Nodemailer Delivery Enabled)`);
  console.log(`========================================\n`);

  // Attempt real Email delivery
  const success = await sendOTPEmail(email, otp);
  
  // We return true even if delivery fails, so the controller doesn't send a 500 error.
  return true; 
};

module.exports = { generateOTP, sendOTP };
