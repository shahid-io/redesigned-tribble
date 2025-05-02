/**
 * Required dependencies
 * - nodemailer: For sending emails
 * - node-cache: For rate limiting and caching
 * - Logger: For application logging
 */
const nodemailer = require('nodemailer');
const NodeCache = require('node-cache');
const { Logger } = require('../config');

/**
 * @class EmailService
 * @description Handles all email-related operations including:
 * - OTP delivery for user verification
 * - Rate limiting for email sends
 * - Retry mechanism for failed attempts
 * - Development/Production environment handling
 * 
 * @example
 * const emailService = new EmailService();
 * await emailService.sendOTPEmail('user@example.com', '123456');
 */
class EmailService {
    /**
     * Creates an instance of EmailService
     * 
     * @constructor
     * @description Initializes:
     * - Email cache for rate limiting (5 minutes TTL)
     * - Maximum retry attempts for failed sends
     * - Transporter instance (lazy loaded)
     */
    constructor() {
        this.emailCache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
        this.maxRetries = 3; // Maximum retry attempts
    }

    /**
     * Creates or returns existing nodemailer transporter
     * 
     * @description
     * In development:
     * - Creates ethereal test account
     * - Uses ethereal SMTP server
     * - Provides preview URLs for sent emails
     * 
     * In production:
     * - Uses configured SMTP settings
     * - Requires following environment variables:
     *   - SMTP_HOST: SMTP server hostname
     *   - SMTP_PORT: SMTP server port
     *   - SMTP_SECURE: Use TLS if true
     *   - SMTP_USER: SMTP authentication username
     *   - SMTP_PASS: SMTP authentication password
     * 
     * @returns {Promise<Mail>} Configured nodemailer transporter
     * @throws {Error} If SMTP configuration is invalid
     */
    async getTransporter() {
        if (!this.transporter) {
            if (process.env.NODE_ENV === 'development') {
                // Development environment setup
                const testAccount = await nodemailer.createTestAccount();
                Logger.info('Test email account created:', testAccount);

                this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
            } else {
                // Production environment setup
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
            }
        }
        return this.transporter;
    }

    /**
     * Send email with retry mechanism
     * 
     * @description
     * Attempts to send an email using nodemailer transporter.
     * Implements retry mechanism with exponential backoff for failed attempts.
     * Logs preview URL in development mode.
     * 
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - Email HTML content
     * @param {number} [retryCount=0] - Current retry attempt
     * @returns {Promise<Object>} Send result
     */
    async sendEmail(to, subject, html, retryCount = 0) {
        try {
            const transporter = await this.getTransporter();
            const info = await transporter.sendMail({
                from: process.env.NODE_ENV === 'development' ? 
                    'test@example.com' : process.env.SMTP_FROM,
                to,
                subject,
                html
            });

            if (process.env.NODE_ENV === 'development') {
                Logger.info('Preview URL:', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            Logger.error(`Failed to send email to ${to}:`, error);

            if (retryCount < this.maxRetries) {
                const nextRetryDelay = this.calculateBackoff(retryCount);
                Logger.info(`Retrying email to ${to} in ${nextRetryDelay}ms (Attempt ${retryCount + 1}/${this.maxRetries})`);
                
                return new Promise((resolve) => {
                    setTimeout(async () => {
                        resolve(await this.sendEmail(to, subject, html, retryCount + 1));
                    }, nextRetryDelay);
                });
            }

            return {
                success: false,
                error: {
                    message: 'Failed to send email after multiple retries',
                    code: 'EMAIL_SEND_FAILED',
                    details: error.message
                }
            };
        }
    }

    /**
     * Implements exponential backoff for retries
     * 
     * @description
     * Calculates delay using exponential backoff formula:
     * delay = min(2^retryCount * 1000ms, 10000ms)
     * 
     * Retry delays:
     * - 1st retry: 1000ms (1s)
     * - 2nd retry: 2000ms (2s)
     * - 3rd retry: 4000ms (4s)
     * - Maximum delay cap: 10000ms (10s)
     * 
     * @param {number} retryCount - Current retry attempt number
     * @returns {number} Delay in milliseconds before next retry
     */
    calculateBackoff(retryCount) {
        return Math.min(Math.pow(2, retryCount) * 1000, 10000);
    }

    /**
     * Sends OTP verification email with rate limiting
     * 
     * @description
     * - Generates HTML email using template
     * - Implements rate limiting using cache
     * - Prevents spam by enforcing cooldown
     * - Updates cache on successful send
     * 
     * Rate limiting:
     * - Cache key format: `otp_${email}`
     * - TTL: 5 minutes (configured in constructor)
     * 
     * @param {string} email - Recipient's email address
     * @param {string} otp - Generated OTP code
     * @returns {Promise<Object>} Send result with success/error status
     */
    async sendOTPEmail(email, otp) {
        const subject = 'Your Verification Code';
        const html = this.getOTPEmailTemplate(otp);
        
        // Prevent OTP spam by checking cache
        const cacheKey = `otp_${email}`;
        if (this.emailCache.has(cacheKey)) {
            return {
                success: false,
                error: {
                    message: 'Please wait before requesting another OTP',
                    code: 'OTP_RATE_LIMIT'
                }
            };
        }

        const result = await this.sendEmail(email, subject, html);
        if (result.success) {
            this.emailCache.set(cacheKey, true);
        }
        return result;
    }

    /**
     * Generates HTML template for OTP emails
     * 
     * @description
     * Creates responsive HTML email template with:
     * - Arial font for better compatibility
     * - Max width constraint for readability
     * - Centered layout
     * - Large, spaced OTP display
     * - Expiry time information
     * - Security disclaimer
     * 
     * @param {string} otp - OTP code to include in template
     * @returns {string} HTML email template
     */
    getOTPEmailTemplate(otp) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Your Verification Code</h2>
                <p>Please use the following code to verify your account:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px;">${otp}</h1>
                <p>This code will expire in ${process.env.OTP_EXPIRY || 10} minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        `;
    }
}

// Export singleton instance
module.exports = new EmailService();
