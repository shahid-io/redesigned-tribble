const { StatusCodes } = require('../types/response');
const { AuthService } = require('../services');
const { Logger } = require('../config');

class AuthController {
    async signup(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const userCountry = req.headers['x-user-country'] || 'UNKNOWN';
            
            const response = await AuthService.register({ email, password, name }, userCountry);
            
            return res
                .status(response.success ? StatusCodes.CREATED : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in signup:', error);
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
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
            const response = await AuthService.verifyOTP(userId, code);
            
            return res
                .status(response.success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in OTP verification:', error);
            next(error);
        }
    }

    async resendOTP(req, res, next) {
        try {
            const { userId } = req.body;
            const response = await AuthService.resendOTP(userId);
            
            return res
                .status(response.success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in resending OTP:', error);
            next(error);
        }
    }
}

module.exports = new AuthController();
