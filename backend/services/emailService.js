const nodemailer = require('nodemailer');

// Initialize transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('[Email] ❌ Nodemailer verification failed:', error.message);
  } else {
    console.log('[Email] ✓ Nodemailer is ready to send emails');
  }
});

/**
 * Send a welcome email to a new user
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (email, name) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] ⚠️ Skip sending welcome email (Credentials missing)');
    return;
  }

  try {
    const mailOptions = {
      from: `"SmartGov Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to SmartGov Bills Platform! 🏛️',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #1e293b;">
          <h1 style="color: #7c3aed;">Welcome, ${name}!</h1>
          <p>Thank you for establishing your digital civic identity with SmartGov.</p>
          <p>You can now easily calculate and pay your utility bills, view your history, and manage your receipts all in one place.</p>
          <div style="margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #7c3aed;">
            <strong>Next Steps:</strong><br/>
            - Link your meter IDs in the dashboard<br/>
            - Calculate your upcoming property tax<br/>
            - Chat with SmartGov AI for any questions
          </div>
          <p>Best regards,<br/>The SmartGov Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✓ Welcome email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] ❌ Failed to send welcome email: ${error.message}`);
  }
};

/**
 * Send a payment receipt email
 * @param {string} email - Recipient email
 * @param {Object} paymentData - Transaction details
 */
const sendPaymentReceipt = async (email, paymentData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] ⚠️ Skip sending receipt email (Credentials missing)');
    return;
  }

  try {
    const mailOptions = {
      from: `"SmartGov Payments" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payment Receipt: ${paymentData.billType} Bill - ₹${paymentData.amount} 💳`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #1e293b;">
          <h2 style="color: #0d9488;">Payment Successful!</h2>
          <p>Dear Citizen, your payment has been successfully processed.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b;">Bill Type:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${paymentData.billType}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b;">Amount Paid:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0d9488;">₹${paymentData.amount}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b;">Transaction ID:</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace;">${paymentData.transactionId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 0; color: #64748b;">Date:</td>
              <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>

          <p>You can download the full PDF receipt from your dashboard history.</p>
          <p>Regards,<br/>SmartGov Billing Support</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✓ Receipt sent to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email] ❌ Failed to send receipt email: ${error.message}`);
  }
};

/**
 * Send an OTP verification code
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit code
 */
const sendOTPEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] ⚠️ Skip sending OTP email (Credentials missing)');
    return;
  }

  try {
    console.log("Starting OTP email send...");

    const mailOptions = {
      from: `"SmartGov Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your SmartGov Verification Code: ${otp} 🛡️`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #7c3aed; margin: 0;">SmartGov</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Secure Citizen Identity</p>
          </div>
          <h2 style="color: #1e293b;">Verification Code</h2>
          <p>Please use the following single-use code to verify your account. This code will expire in 5 minutes.</p>
          
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">${otp}</span>
          </div>

          <p style="font-size: 12px; color: #94a3b8;">If you did not request this code, please ignore this email or contact support if you suspect unauthorized activity.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">🏛️ SmartGov E-Bills Platform</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ✓ OTP email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] ❌ Failed to send OTP email: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPaymentReceipt,
  sendOTPEmail,
};
