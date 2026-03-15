const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smartgovtbills@gmail.com',
    pass: 'devv kwmt oqaw ihf'
  }
});

async function test() {
  try {
    console.log('Testing with smartgovtbills@gmail.com...');
    await transporter.verify();
    console.log('✅ SUCCESS!');
    
    await transporter.sendMail({
      from: '"SmartGov" <smartgovtbills@gmail.com>',
      to: 'anshulupwanshi007@gmail.com',
      subject: 'Nodemailer Fixed!',
      text: 'This worked!'
    });
    console.log('Email sent.');
  } catch (err) {
    console.error('❌ FAILED:', err.message);
  }
}

test();
