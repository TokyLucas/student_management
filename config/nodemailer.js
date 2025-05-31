const nodemailer = require('nodemailer');
require('dotenv').config();

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  return { transporter, testAccount };
}

module.exports = createTestAccount;
