const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Outlook',
  auth: {
    user: 'sistemas6@hospitalsanrafaeltunja.gov.co',
    pass: 'gkybzmplhrfsyddx'
  }
});

module.exports = transporter;
