const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anshulupwanshi007@gmail.com',
    pass: 'devv kwmt oqaw ihf'
  }
});

async function test() {
  try {
    console.log('Testing with hardcoded credentials...');
    await transporter.verify();
    console.log('✅ SUCCESS!');
    
    await transporter.sendMail({
      from: '"SmartGov Fix" <anshulupwanshi007@gmail.com>',
      to: 'anshulupwanshi007@gmail.com',
      subject: 'Hardcoded Success',
      text: 'This worked!'
    });
    console.log('Email sent.');
  } catch (err) {
    console.error('❌ FAILED:', err.message);
  }
}

test();
