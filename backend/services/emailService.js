const nodemailer = require('nodemailer');

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '', 
    pass: process.env.EMAIL_PASS || '', 
  },
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

module.exports = {
  sendWelcomeEmail,
  sendPaymentReceipt,
};
