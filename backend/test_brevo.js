const axios = require('axios');
require('dotenv').config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'no-reply@smartgov.com';
const SENDER_NAME = 'SmartGov Security';

const email = 'smartgovtbills@gmail.com'; // Send to self for test
const otp = '123456';

const sendOTPEmail = async (email, otp) => {
  if (!BREVO_API_KEY) {
    console.log('[Brevo] ⚠️ Skip sending OTP email (BREVO_API_KEY missing)');
    return;
  }

  try {
    console.log(`[Brevo] Starting OTP email send to ${email}...`);

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: email }],
        subject: `Your SmartGov Verification Code: ${otp} 🛡️`,
        htmlContent: `<h1>Test OTP: ${otp}</h1>`,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log(`[Brevo] ✓ OTP email sent to ${email}: messageId ${response.data.messageId}`);
    return true;
  } catch (error) {
    if (error.response) {
      console.error(`[Brevo] ❌ Failed to send OTP email: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`[Brevo] ❌ Failed to send OTP email: ${error.message}`);
    }
    return false;
  }
};

sendOTPEmail(email, otp);
