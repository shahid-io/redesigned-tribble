/**
 * Email Configuration Module
 * @module MailConfig
 * @description Handles email transport setup and email sending utilities
 * 
 * @requires nodemailer - Email sending library
 * @requires crypto-js - Cryptographic functions
 * @requires Logger - Application logging utility
 */
const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');
const { Logger } = require('./index');

/** @type {import('nodemailer').Transporter} */
let transporter;

/**
 * Initialize Email Transport
 * @description Sets up Gmail SMTP transport with authentication
 * 
 * Required Environment Variables:
 * - SMTP_USER: Gmail email address
 * - SMTP_PASS: Gmail app-specific password
 * 
 * Security Features:
 * - TLS enabled
 * - Connection verification
 * - Error handling
 * 
 * @async
 * @function initializeMailer
 * @throws {Error} If mailer initialization fails
 * @returns {Promise<void>}
 */
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

/**
 * Generate Secure OTP
 * @description Generates a cryptographically secure 6-digit OTP
 * 
 * Implementation Details:
 * 1. Generates 4 random bytes using CryptoJS
 * 2. Converts to hexadecimal string
 * 3. Transforms to 6-digit number
 * 4. Ensures leading zeros by adding 100000
 * 
 * @function generateOTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  const randomBytes = CryptoJS.lib.WordArray.random(4);
  const number = parseInt(randomBytes.toString(), 16);
  return (number % 900000 + 100000).toString();
};

/**
 * Send Email
 * @description Sends an email using configured transport
 * 
 * Features:
 * - Transport validation
 * - Error handling
 * - Success tracking
 * - Logging
 * 
 * @async
 * @function sendMail
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of email
 * @returns {Promise<Object>} Send result with success status
 */
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

/**
 * Send OTP Email
 * @description Sends verification email with OTP
 * 
 * Features:
 * - Responsive HTML template
 * - Development mode OTP exposure
 * - Error handling
 * 
 * Template Features:
 * - Mobile-friendly design
 * - Clear typography
 * - Security disclaimer
 * - Expiry information
 * 
 * @async
 * @function sendOTPEmail
 * @param {string} to - Recipient email
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} Send result with optional OTP in development
 */
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
