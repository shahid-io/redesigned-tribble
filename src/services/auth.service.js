const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { User, OTP } = require('../models');
const { ServerConfig, Logger } = require('../config');
const { AUTH_ERRORS, OTP_CONFIG, RESTRICTED_COUNTRIES } = require('../constants/auth.constants');
const { ErrorCodes } = require('../types/response');
const { sendMail } = require('../config/mail-config');
const { Op } = require('sequelize');

/**
 * Authentication Service
 * Handles user registration, login, and email verification
 */
class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userCountry - User's country code
     * @returns {Promise<Object>} Registration result
     */
    async register(userData, userCountry) {
        try {
            if (RESTRICTED_COUNTRIES.includes(userCountry)) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.RESTRICTED_LOCATION,
                        code: ErrorCodes.RESTRICTED_LOCATION
                    }
                };
            }

            const existingUser = await User.findOne({ where: { email: userData.email } });
            if (existingUser) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.USER_EXISTS,
                        code: ErrorCodes.USER_EXISTS
                    }
                };
            }

            const user = await User.create({
                ...userData,
                country: userCountry
            });

            const otp = await this.generateOTP(user.id);
            
            // Send OTP email
            const emailResult = await this.sendVerificationEmail(user.email, otp.code);
            
            if (!emailResult.success) {
                Logger.error('Failed to send verification email:', emailResult.error);
                // You might want to delete the user and return an error
                await user.destroy();
                return {
                    success: false,
                    error: {
                        message: 'Failed to send verification email',
                        code: ErrorCodes.SERVER_ERROR,
                        details: emailResult.error
                    }
                };
            }

            const response = {
                success: true,
                data: { 
                    message: 'Registration successful. Please check your email for verification code.',
                    userId: user.id
                }
            };

            if (process.env.NODE_ENV === 'development') {
                response.data.otp = otp.code;
                response.data.emailPreview = emailResult.previewURL;
            }

            return response;
        } catch (error) {
            Logger.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Send verification email to user
     * @param {string} email - User's email address
     * @param {string} otp - Generated OTP code
     * @returns {Promise<Object>} Email sending result
     */
    async sendVerificationEmail(email, otp) {
        const subject = 'Verify Your Email';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f4; padding: 10px; text-align: center;">${otp}</h1>
                <p>This code will expire in ${process.env.OTP_EXPIRY || 10} minutes.</p>
            </div>
        `;

        Logger.info(`Sending verification email to: ${email}`);
        return await sendMail(email, subject, html);
    }

    /**
     * Resend OTP to user
     * @param {string} userId - User's ID
     * @returns {Promise<Object>} OTP resend result
     */
    async resendOTP(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.UNVERIFIED_USER,
                        code: ErrorCodes.UNAUTHORIZED
                    }
                };
            }

            // Generate new OTP
            const otp = await this.generateOTP(user.id);
            
            // Send new verification email
            const emailResult = await this.sendVerificationEmail(user.email, otp.code);
            
            if (!emailResult.success) {
                Logger.error('Failed to send verification email:', emailResult.error);
                return {
                    success: false,
                    error: {
                        message: 'Failed to send verification email',
                        code: ErrorCodes.SERVER_ERROR
                    }
                };
            }

            return {
                success: true,
                data: { 
                    message: 'OTP sent successfully',
                    userId: user.id,
                    ...(process.env.NODE_ENV === 'development' && { otp: otp.code })
                }
            };
        } catch (error) {
            Logger.error('Resend OTP error:', error);
            throw error;
        }
    }

    /**
     * Verify user's OTP code
     * @param {string} userId - User's ID
     * @param {string} code - OTP code to verify
     * @returns {Promise<Object>} Verification result
     */
    async verifyOTP(userId, code) {
        try {
            Logger.info(`Verifying OTP for user: ${userId} with code: ${code}`); 
            const otp = await OTP.findOne({
                where: {
                    userId,
                    code: code.toString(),
                    isUsed: false,
                    expiresAt: { [Op.gt]: new Date() }
                }
            });

            if (!otp) {
                Logger.warn(`Invalid OTP attempt for user: ${userId}`);
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.INVALID_OTP,
                        code: ErrorCodes.INVALID_OTP
                    }
                };
            }

            // Mark OTP as used and verify user
            await Promise.all([
                User.update({ isVerified: true }, { where: { id: userId } }),
                OTP.update({ isUsed: true }, { where: { id: otp.id } })
            ]);

            const user = await User.findByPk(userId);
            
            // Ensure JWT_EXPIRY is properly configured
            const jwtExpiry = ServerConfig.JWT_EXPIRY || '24h';
            Logger.info(`Generating JWT token with expiry: ${jwtExpiry}`);
            
            const token = jwt.sign(
                { id: user.id, email: user.email },
                ServerConfig.JWT_SECRET,
                { expiresIn: jwtExpiry }
            );

            return {
                success: true,
                data: { 
                    message: 'Email verified successfully',
                    token,
                    user: this.sanitizeUser(user)
                }
            };
        } catch (error) {
            Logger.error(`Error verifying OTP for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Generate new OTP for user
     * @param {string} userId - User's ID
     * @returns {Promise<Object>} Generated OTP object
     */
    async generateOTP(userId) {
        // Generate a secure random number and take first OTP_CONFIG.LENGTH digits
        const randomBytes = CryptoJS.lib.WordArray.random(32);
        const code = randomBytes.toString(CryptoJS.enc.Hex)
            .split('')
            .filter(char => /\d/.test(char))
            .slice(0, OTP_CONFIG.LENGTH)
            .join('');

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_CONFIG.EXPIRY_MINUTES);

        return OTP.create({
            userId,
            code,
            expiresAt
        });
    }

    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user.toJSON();
        return sanitizedUser;
    }

    /**
     * Authenticate user login
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<Object>} Login result with token
     */
    async login(email, password) {
        try {
            if (!email || !password) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.INVALID_CREDENTIALS,
                        code: ErrorCodes.UNAUTHORIZED
                    }
                };
            }

            const user = await User.findOne({ 
                where: { email }
            });

            if (!user || !await user.validatePassword(password)) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.INVALID_CREDENTIALS,
                        code: ErrorCodes.UNAUTHORIZED
                    }
                };
            }

            if (!user.isVerified) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.UNVERIFIED_USER,
                        code: ErrorCodes.UNAUTHORIZED,
                        userId: user.id 
                    }
                };
            }

            await user.update({ lastLoginAt: new Date() });

            const token = jwt.sign(
                { id: user.id, email: user.email },
                ServerConfig.JWT_SECRET,
                { expiresIn: ServerConfig.JWT_EXPIRY }
            );

            return {
                success: true,
                data: {
                    token,
                    user: this.sanitizeUser(user)
                }
            };
        } catch (error) {
            Logger.error('Login error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();
