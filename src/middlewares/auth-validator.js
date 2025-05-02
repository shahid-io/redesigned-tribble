/**
 * Authentication Validation Middleware
 * @module AuthValidator
 * @description Validates authentication-related requests
 * 
 * @requires StatusCodes - HTTP status codes
 * @requires ErrorCodes - Application error codes
 * @requires Logger - Application logging
 */
const { StatusCodes, ErrorCodes } = require('../types/response');
const { Logger } = require('../config');

/**
 * Validate User Registration Data
 * @description Validates required fields and format for user registration
 * 
 * Validation Rules:
 * - Required fields: email, password, name
 * - Email format: username@domain.tld
 * - Password length: minimum 6 characters
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware
 * @returns {void|Response} Proceeds to next middleware or returns error
 */
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

    /**
     * Email validation regex breakdown:
     * ^             - Start of string
     * [\w-]+       - One or more word chars or hyphens (username)
     * (\.[\w-]+)*  - Optional groups of dot followed by word chars/hyphens
     * @            - Literal @ symbol
     * ([\w-]+\.)+ - One or more groups of word chars/hyphens followed by dot
     * [a-zA-Z]{2,7}$ - 2-7 letters for top-level domain
     */
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

/**
 * Validate Login Credentials
 * @description Ensures required login fields are present
 * 
 * Required Fields:
 * - email
 * - password
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware
 * @returns {void|Response} Proceeds to next middleware or returns error
 */
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

/**
 * Validate OTP Request
 * @description Validates OTP verification request data
 * 
 * Validation:
 * - Required fields: userId, code
 * - Code conversion to string
 * - Error logging
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware
 * @returns {void|Response} Proceeds to next middleware or returns error
 */
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

/**
 * Export validation middlewares
 * @exports {Object} Authentication validation middlewares
 */
module.exports = {
    validateUserSignup,
    validateAuth,
    validateOTP
};
