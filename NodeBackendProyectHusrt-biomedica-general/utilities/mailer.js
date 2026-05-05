const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Outlook',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

module.exports = transporter;
