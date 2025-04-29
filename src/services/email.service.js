const nodemailer = require('nodemailer');
const NodeCache = require('node-cache');
const { Logger } = require('../config');

class EmailService {
    constructor() {
        this.emailCache = new NodeCache({ stdTTL: 300 });
        this.maxRetries = 3;
    }

    async getTransporter() {
        if (!this.transporter) {
            if (process.env.NODE_ENV === 'development') {
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

    calculateBackoff(retryCount) {
        // Exponential backoff: 2^retryCount * 1000ms (1s, 2s, 4s)
        return Math.min(Math.pow(2, retryCount) * 1000, 10000);
    }

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

module.exports = new EmailService();
