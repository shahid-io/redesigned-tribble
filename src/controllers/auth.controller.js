/**
 * Authentication Controller
 * @module AuthController
 * @description Handles all authentication-related HTTP requests
 * 
 * @requires StatusCodes - HTTP status codes enum
 * @requires ErrorCodes - Application error codes
 * @requires AuthService - Authentication business logic
 * @requires Logger - Application logging utility
 */
const { StatusCodes, ErrorCodes } = require('../types/response');
const { AuthService } = require('../services');
const { Logger } = require('../config');

/**
 * @class AuthController
 * @description Controller for handling authentication operations
 * 
 * Features:
 * - User registration with geo-restriction
 * - OTP verification system
 * - User login with JWT
 * - OTP resend functionality
 */
class AuthController {
    /**
     * @method signup
     * @description Register new user with geo-restriction check
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User's email
     * @param {string} req.body.password - User's password
     * @param {string} req.body.name - User's name
     * @param {Object} req.geoData - Geo-location data from middleware
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response
     */
    async signup(req, res, next) {
        try {
            const { email, password, name } = req.body;
            
            // Use geoData from middleware instead of headers
            if (!req.geoData || !req.geoData.countryCode) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'Unable to determine your location',
                        code: ErrorCodes.VALIDATION_ERROR
                    }
                });
            }

            Logger.info(`Processing signup request from ${req.geoData.country} (${req.geoData.countryCode})`);
            
            const response = await AuthService.register(
                { email, password, name },
                req.geoData.countryCode
            );
            
            return res
                .status(response.success ? StatusCodes.CREATED : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in signup:', error);
            next(error);
        }
    }

    /**
     * @method resendOTP
     * @description Resend OTP to user's email
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.userId - User's ID
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response
     */
    async resendOTP(req, res, next) {
        try {
            const { userId } = req.body;
            
            if (!userId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'userId is required',
                        code: ErrorCodes.VALIDATION_ERROR
                    }
                });
            }

            const response = await AuthService.resendOTP(userId);
            return res
                .status(response.success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in resending OTP:', error);
            next(error);
        }
    }

    /**
     * @method login
     * @description Authenticate user and generate JWT
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User's email
     * @param {string} req.body.password - User's password
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with JWT
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'Email and password are required',
                        code: ErrorCodes.VALIDATION_ERROR
                    }
                });
            }

            const response = await AuthService.login(email, password);
            return res
                .status(response.success ? StatusCodes.OK : StatusCodes.UNAUTHORIZED)
                .json(response);
        } catch (error) {
            Logger.error('Error in login:', error);
            next(error);
        }
    }

    /**
     * @method verifyOTP
     * @description Verify OTP code and activate user account
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.userId - User's ID
     * @param {string} req.body.code - OTP code
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response
     */
    async verifyOTP(req, res, next) {
        try {
            const { userId, code } = req.body;
            
            if (!code) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'OTP code is required',
                        code: ErrorCodes.VALIDATION_ERROR
                    }
                });
            }

            const response = await AuthService.verifyOTP(userId, code.toString());
            return res
                .status(response.success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in OTP verification:', error);
            next(error);
        }
    }
}

// Export singleton instance
module.exports = new AuthController();
