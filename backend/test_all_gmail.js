const nodemailer = require('nodemailer');
require('dotenv').config();

const users = ['anshulupwanshi007@gmail.com', 'smartgovtbills@gmail.com'];
const passes = ['devvkwmtoqawihf', 'devv kwmt oqaw ihf'];
const configs = [
  { service: 'gmail' },
  { host: 'smtp.gmail.com', port: 465, secure: true },
  { host: 'smtp.gmail.com', port: 587, secure: false }
];

async function runTests() {
  for (const user of users) {
    for (const pass of passes) {
      for (const config of configs) {
        console.log(`\nTesting: User=${user}, Pass=${pass}, Config=${JSON.stringify(config)}`);
        const transporter = nodemailer.createTransport({
          ...config,
          auth: { user, pass }
        });
        
        try {
          await transporter.verify();
          console.log(`✅ SUCCESS! This combination worked.`);
          return;
        } catch (err) {
          console.log(`❌ Failed: ${err.message.split('\n')[0]}`);
        }
      }
    }
  }
  console.log('\n❌ All combinations failed.');
}

runTests();
