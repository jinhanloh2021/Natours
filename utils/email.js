const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //activate in gmail 'less secure app' option
  });
  // 2. Define email options
  const mailOptions = {
    from: 'Admin <admin@natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3. Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
