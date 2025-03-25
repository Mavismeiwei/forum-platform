require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a test email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD
  }
});

// Test Email
const mailOptions = {
  from: process.env.EMAIL_HOST_USER,
  to: "zhang.meiwe@northeastern.edu", 
  subject: "Test Email from Nodemailer",
  text: "Hello! This is a test email from the Nodemailer service.",
  html: "<p><b>Hello!</b> This is a test email from the Nodemailer service.</p>"
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log(`Email sent successfully! Message ID: ${info.messageId}`);
  }
});
