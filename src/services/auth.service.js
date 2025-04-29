const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { User, OTP } = require('../models');
const { ServerConfig } = require('../config');
const { AUTH_ERRORS, OTP_CONFIG, RESTRICTED_COUNTRIES } = require('../constants/auth.constants');
const { ErrorCodes } = require('../types/response');
const emailService = require('./email.service');

class AuthService {
    async register(userData, userCountry) {
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
        const emailResult = await emailService.sendOTPEmail(user.email, otp.code);
        
        if (!emailResult.success) {
            Logger.warn(`Failed to send OTP email to ${user.email}:`, emailResult.error);
        }

        return {
            success: true,
            data: { 
                message: 'Registration successful. Please verify your email.',
                userId: user.id 
            }
        };
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
        const otp = await OTP.findOne({
            where: {
                userId,
                code,
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!otp) {
            return {
                success: false,
                error: {
                    message: AUTH_ERRORS.INVALID_OTP,
                    code: ErrorCodes.INVALID_OTP
                }
            };
        }

        await Promise.all([
            User.update({ isVerified: true }, { where: { id: userId } }),
            OTP.update({ isUsed: true }, { where: { id: otp.id } })
        ]);

        return {
            success: true,
            data: { message: 'Email verified successfully' }
        };
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
}

module.exports = new AuthService();
