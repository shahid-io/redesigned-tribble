const nodemailer = require('nodemailer');
const { Logger } = require('./index');

let testAccount;
let transporter;

const initializeMailer = async () => {
    try {
        if (process.env.NODE_ENV === 'development') {
            testAccount = await nodemailer.createTestAccount();
            Logger.info('Test email account:', { user: testAccount.user, pass: testAccount.pass });

            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass }
            });
        } else {
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
    } catch (error) {
        Logger.error('Failed to initialize mailer:', error);
        throw error;
    }
};

const sendMail = async (to, subject, html, retryCount = 0) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.NODE_ENV === 'development' ? testAccount.user : process.env.SMTP_FROM,
            to,
            subject,
            html
        });

        if (process.env.NODE_ENV === 'development') {
            Logger.info('Preview URL:', nodemailer.getTestMessageUrl(info));
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
