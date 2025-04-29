const nodemailer = require('nodemailer');
const { Logger } = require('./index');

let testAccount;
let transporter;

const initializeMailer = async () => {
    if (process.env.NODE_ENV === 'development') {
        /**
         * Create test account for development
         */
        testAccount = await nodemailer.createTestAccount();
        Logger.info('Test email account created:', testAccount.user);

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } else {
        /**
         * Production mailer config
         */
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
};

const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            html
        });

        if (process.env.NODE_ENV === 'development') {
            /**
             * Log preview URL in development mode
             */
            Logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        } else {
            Logger.info('Email sent to: %s', to);
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        Logger.error('Email sending failed:', error);
        return { success: false, error };
    }
};

module.exports = {
    initializeMailer,
    sendMail
};
