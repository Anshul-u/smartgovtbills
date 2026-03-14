require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Starting email test...");
  console.log("User:", process.env.EMAIL_USER);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test",
      text: "Test email",
    });
    console.log("Success:", info.messageId);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testEmail();
