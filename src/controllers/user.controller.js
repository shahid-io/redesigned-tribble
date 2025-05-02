/**
 * User Controller
 * @module UserController
 * @description Handles all user profile management HTTP requests
 * 
 * @requires StatusCodes - HTTP status codes enum
 * @requires ErrorCodes - Application error codes
 * @requires UserService - User management business logic
 * @requires Logger - Application logging utility
 */
const { StatusCodes, createSuccess, createError, ErrorCodes } = require('../types/response');
const { UserService } = require('../services');
const { Logger } = require('../config');

/**
 * @class UserController
 * @description Controller for handling user operations
 * 
 * Features:
 * - Profile retrieval
 * - Profile updates
 * - Password management
 * - Account deletion
 */
class UserController {
    /**
     * @method getProfile
     * @description Retrieve authenticated user's profile
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.user - Authenticated user object from middleware
     * @param {string} req.user.id - User's ID
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with user profile
     */
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

    /**
     * @method updateProfile
     * @description Update user profile information
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user.id - User's ID
     * @param {Object} req.body - Update data
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with updated profile
     */
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

    /**
     * @method changePassword
     * @description Change user's password with verification
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user.id - User's ID
     * @param {Object} req.body - Password data
     * @param {string} req.body.currentPassword - Current password
     * @param {string} req.body.newPassword - New password
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response
     */
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

    /**
     * @method deleteAccount
     * @description Permanently delete user account
     * 
     * @param {Request} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user.id - User's ID
     * 
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response
     */
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

// Export singleton instance
module.exports = new UserController();
