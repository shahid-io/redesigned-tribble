const { User } = require('../models');
const { Logger } = require('../config');
const { createSuccess, createError, ErrorCodes } = require('../types/response');
const bcrypt = require('bcrypt');

/**
 * User Service
 * Handles user profile management operations and data sanitization
 */
class UserService {
    /**
     * Retrieves a user's profile information
     * @param {string} userId - User's unique identifier
     * @returns {Promise<AppSuccess|AppError>} User profile data or error
     */
    async getProfile(userId) {
        try {
            // Attempt to find user by primary key (ID)
            const user = await User.findByPk(userId);
            // Return error if user doesn't exist
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }
            // Return sanitized user data without sensitive information
            return createSuccess(this.sanitizeUser(user));
        } catch (error) {
            // Log error for debugging and monitoring
            Logger.error('Error in getProfile:', error);
            throw error;
        }
    }

    /**
     * Updates user profile information
     * @param {string} userId - User's unique identifier
     * @param {Object} updateData - Fields to update
     * @param {string} [updateData.name] - User's new name
     * @param {string} [updateData.phoneNumber] - User's new phone number
     * @returns {Promise<AppSuccess|AppError>} Updated profile or error
     */
    async updateProfile(userId, updateData) {
        try {
            // Find user by ID
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }

            // Extract updateable fields
            const { name, phoneNumber } = updateData;
            // Only update fields that are provided
            await user.update({ 
                ...(name && { name }), // Conditionally include name if provided
                ...(phoneNumber && { phoneNumber }) // Conditionally include phoneNumber if provided
            });

            // Return updated and sanitized user data
            return createSuccess(this.sanitizeUser(user));
        } catch (error) {
            Logger.error('Error in updateProfile:', error);
            throw error;
        }
    }

    /**
     * Changes user's password with validation
     * @param {string} userId - User's unique identifier
     * @param {string} currentPassword - Current password for verification
     * @param {string} newPassword - New password to set
     * @returns {Promise<AppSuccess|AppError>} Password change result
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Find user by ID
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }

            // Verify current password is correct
            const isValid = await user.validatePassword(currentPassword);
            if (!isValid) {
                return createError('Current password is incorrect', ErrorCodes.INVALID_CREDENTIALS);
            }

            // Hash new password and save
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return createSuccess({ message: 'Password updated successfully' });
        } catch (error) {
            Logger.error('Error in changePassword:', error);
            throw error;
        }
    }

    /**
     * Permanently deletes a user account
     * @param {string} userId - User's unique identifier
     * @returns {Promise<AppSuccess|AppError>} Deletion result
     */
    async deleteAccount(userId) {
        try {
            // Find user by ID
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }

            // Permanently delete user from database
            await user.destroy();
            return createSuccess({ message: 'Account deleted successfully' });
        } catch (error) {
            Logger.error('Error in deleteAccount:', error);
            throw error;
        }
    }

    /**
     * Removes sensitive information from user object
     * @param {Object} user - User instance to sanitize
     * @returns {Object} Sanitized user object without password
     */
    sanitizeUser(user) {
        // Remove password from user data before sending to client
        const { password, ...sanitizedUser } = user.toJSON();
        return sanitizedUser;
    }
}

// Export singleton instance
module.exports = new UserService();
