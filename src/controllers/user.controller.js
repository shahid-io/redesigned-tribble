const { StatusCodes, createSuccess, createError, ErrorCodes } = require('../types/response');
const { UserService } = require('../services');
const { Logger } = require('../config');

class UserController {
    async getProfile(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(StatusCodes.UNAUTHORIZED).json(
                    createError('User not authenticated', ErrorCodes.UNAUTHORIZED)
                );
            }

            const response = await UserService.getProfile(req.user.id);
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in getProfile:', error);
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(StatusCodes.UNAUTHORIZED).json(
                    createError('User not authenticated', ErrorCodes.UNAUTHORIZED)
                );
            }

            const response = await UserService.updateProfile(req.user.id, req.body);
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in updateProfile:', error);
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(StatusCodes.UNAUTHORIZED).json(
                    createError('User not authenticated', ErrorCodes.UNAUTHORIZED)
                );
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    createError('Current password and new password are required', ErrorCodes.MISSING_REQUIRED_FIELDS)
                );
            }

            const response = await UserService.changePassword(
                req.user.id,
                currentPassword,
                newPassword
            );
            return res.status(response.success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
                .json(response);
        } catch (error) {
            Logger.error('Error in changePassword:', error);
            next(error);
        }
    }

    async deleteAccount(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(StatusCodes.UNAUTHORIZED).json(
                    createError('User not authenticated', ErrorCodes.UNAUTHORIZED)
                );
            }

            const response = await UserService.deleteAccount(req.user.id);
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in deleteAccount:', error);
            next(error);
        }
    }
}

module.exports = new UserController();
