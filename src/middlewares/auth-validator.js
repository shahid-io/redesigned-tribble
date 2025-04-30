const { StatusCodes, ErrorCodes } = require('../types/response');
const { Logger } = require('../config');

const validateUserSignup = (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Missing required fields: email, password, and name are required',
                code: ErrorCodes.MISSING_REQUIRED_FIELDS
            }
        });
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Please provide a valid email address',
                code: ErrorCodes.INVALID_EMAIL_FORMAT
            }
        });
    }

    if (password.length < 6) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Password must be at least 6 characters long',
                code: ErrorCodes.INVALID_PASSWORD_FORMAT
            }
        });
    }

    next();
};

const validateAuth = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Both email and password are required',
                code: ErrorCodes.MISSING_REQUIRED_FIELDS
            }
        });
    }

    next();
};

const validateOTP = (req, res, next) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        Logger.warn('Missing userId or code in OTP verification request');
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'User ID and verification code are required',
                code: ErrorCodes.MISSING_REQUIRED_FIELDS
            }
        });
    }

    try {
        req.body.code = code.toString();
        Logger.debug(`OTP validation passed for user: ${userId}`);
        next();
    } catch (error) {
        Logger.error('Error in OTP validation:', error);
        next(error);
    }
};

module.exports = {
    validateUserSignup,
    validateAuth,
    validateOTP
};
