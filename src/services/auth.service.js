const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { User, OTP } = require('../models');
const { ServerConfig, Logger } = require('../config');
const { AUTH_ERRORS, OTP_CONFIG, RESTRICTED_COUNTRIES } = require('../constants/auth.constants');
const { ErrorCodes } = require('../types/response');
const emailService = require('./email.service');
const { Op } = require('sequelize');

class AuthService {
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
            
            // Development mode: Return OTP in response
            if (process.env.NODE_ENV === 'development') {
                return {
                    success: true,
                    data: { 
                        message: 'Registration successful. Use the OTP to verify your account.',
                        userId: user.id,
                        otp: otp.code, // Only included in development
                        email: user.email
                    }
                };
            }

            // Production mode
            return {
                success: true,
                data: { 
                    message: 'Registration successful. Please check your email for OTP.',
                    userId: user.id
                }
            };
        } catch (error) {
            Logger.error('Registration error:', error);
            throw error;
        }
    }

    async resendOTP(userId) {
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

        const token = jwt.sign(
            { id: user.id, email: user.email },
            ServerConfig.JWT_SECRET,
            { expiresIn: ServerConfig.JWT_EXPIRY }
        );

        return {
            success: true,
            data: { token, user: this.sanitizeUser(user) }
        };
    }

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

    async login(email, password) {
        try {
            const user = await User.findOne({ 
                where: { 
                    email,
                    status: 'active'
                } 
            });

            if (!user) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.INVALID_CREDENTIALS,
                        code: ErrorCodes.UNAUTHORIZED
                    }
                };
            }

            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: {
                        message: AUTH_ERRORS.INVALID_CREDENTIALS,
                        code: ErrorCodes.UNAUTHORIZED
                    }
                };
            }

            // Update last login time
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
