const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  debug: true,
  logger: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function test() {
  console.log('Using User:', process.env.EMAIL_USER);
  console.log('Using Pass:', process.env.EMAIL_PASS ? '********' : 'undefined');
  
  try {
    await transporter.verify();
    console.log('✓ Nodemailer connection verified successfully!');
    
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Nodemailer Test',
      text: 'This is a test email from Nodemailer fix process.'
    });
    console.log('✓ Test email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
  }
}

test();
