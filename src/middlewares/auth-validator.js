const { StatusCodes } = require('../types/response');
const { Logger } = require('../config');

const validateUserSignup = (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Missing required fields',
                code: 'VAL001'
            }
        });
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Invalid email format',
                code: 'VAL002'
            }
        });
    }

    if (password.length < 6) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Password must be at least 6 characters long',
                code: 'VAL003'
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
                message: 'Email and password are required',
                code: 'VAL004'
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
                message: 'userId and code are required',
                code: 'VAL001'
            }
        });
    }

    try {
        // Convert code to string if it's a number
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
