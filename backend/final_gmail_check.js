const nodemailer = require('nodemailer');

const user = 'anshulupwanshi007@gmail.com';
const tokens = ['devvkwmtoqawihf', 'devv kwmt oqaw ihf'];
const configs = [
  { service: 'gmail' },
  { host: 'smtp.gmail.com', port: 465, secure: true },
  { host: 'smtp.gmail.com', port: 587, secure: false }
];

async function finalTest() {
  for (const token of tokens) {
    for (const config of configs) {
      console.log(`Testing: Token="${token}", Config=${JSON.stringify(config)}`);
      const transporter = nodemailer.createTransport({
        ...config,
        auth: { user, pass: token }
      });
      
      try {
        await transporter.verify();
        console.log('✅ THIS WORKED!');
        return;
      } catch (err) {
        console.log(`❌ Failed: ${err.message.split('\n')[0]}`);
      }
    }
  }
  console.log('Final verdict: All permutations failed.');
}

finalTest();
