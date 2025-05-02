const jwt = require('jsonwebtoken');
const { StatusCodes, ErrorCodes, createError } = require('../types/response');
const { ServerConfig, Logger } = require('../config');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Validates JWT tokens and manages user authentication state
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 * @throws {Error} When authentication fails
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                createError('No token provided', ErrorCodes.UNAUTHORIZED)
            );
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        
        try {
            decoded = jwt.verify(token, ServerConfig.JWT_SECRET);
        } catch (error) {
            Logger.error('JWT verification failed:', error);
            return res.status(StatusCodes.UNAUTHORIZED).json(
                createError('Invalid or expired token', ErrorCodes.UNAUTHORIZED)
            );
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                createError('User not found', ErrorCodes.UNAUTHORIZED)
            );
        }

        if (!user.isVerified) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                createError('Email not verified', ErrorCodes.UNAUTHORIZED)
            );
        }

        if (user.status !== 'active') {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                createError('Account is not active', ErrorCodes.UNAUTHORIZED)
            );
        }

        req.user = user;
        Logger.debug(`User authenticated: ${user.id}`);
        next();
    } catch (error) {
        Logger.error('Auth middleware error:', error);
        return res.status(StatusCodes.UNAUTHORIZED).json(
            createError('Authentication failed', ErrorCodes.UNAUTHORIZED)
        );
    }
};

module.exports = authMiddleware;
