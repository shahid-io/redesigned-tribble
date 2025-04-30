const { StatusCodes, ErrorCodes } = require('../types/response');
const { AuthService } = require('../services');
const { Logger } = require('../config');

class AuthController {
    constructor() {}

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

    async verifyOTP(req, res, next) {
        try {
            const { userId, code } = req.body;
            
            if (!code || typeof code !== 'string') {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'Invalid OTP format',
                        code: ErrorCodes.VALIDATION_ERROR
                    }
                });
            }

            const response = await AuthService.verifyOTP(userId, code);
            return res
                .status(response.success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in OTP verification:', error);
            next(error);
        }
    }
}

module.exports = new AuthController();
