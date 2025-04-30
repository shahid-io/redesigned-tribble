const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const { Logger } = require('./index');

let transporter;

const initializeMailer = async () => {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    Logger.info('Email transport ready');
  } catch (error) {
    Logger.error('Failed to initialize mailer:', error.message);
    throw new Error('Mailer initialization failed');
  }
};

const generateOTP = () => {
  const randomBytes = CryptoJS.lib.WordArray.random(4);
  const number = parseInt(randomBytes.toString(), 16);
  return (number % 900000 + 100000).toString();
};

const sendMail = async (to, subject, html) => {
  try {
    if (!transporter) {
      throw new Error('Mailer not initialized');
    }

    Logger.info(`Sending email to: ${to}`);
    const info = await transporter.sendMail({
      from: `"Verification Service" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });

    Logger.info('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    Logger.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendOTPEmail = async (to, userId) => {
  const otp = generateOTP();
  const subject = 'Your Verification Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Email Verification</h2>
      <p style="color: #666;">Hello,</p>
      <p style="color: #666;">Your verification code is:</p>
      <div style="background-color: #f8f8f8; padding: 15px; text-align: center; border-radius: 5px;">
        <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; margin-top: 20px;">This code will expire in 10 minutes.</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  Logger.info(`Sending OTP email to: ${to}`);
  const result = await sendMail(to, subject, html);

  if (process.env.NODE_ENV === 'development') {
    return { ...result, otp };
  }
  return result;
};

module.exports = {
  initializeMailer,
  sendMail,
  sendOTPEmail
};
