const { User } = require('../models');
const { Logger } = require('../config');
const { createSuccess, createError, ErrorCodes } = require('../types/response');
const bcrypt = require('bcrypt');

class UserService {
    async getProfile(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }
            return createSuccess(this.sanitizeUser(user));
        } catch (error) {
            Logger.error('Error in getProfile:', error);
            throw error;
        }
    }

    async updateProfile(userId, updateData) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }

            const { name, phoneNumber } = updateData;
            await user.update({ 
                ...(name && { name }),
                ...(phoneNumber && { phoneNumber })
            });

            return createSuccess(this.sanitizeUser(user));
        } catch (error) {
            Logger.error('Error in updateProfile:', error);
            throw error;
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }

            const isValid = await user.validatePassword(currentPassword);
            if (!isValid) {
                return createError('Current password is incorrect', ErrorCodes.INVALID_CREDENTIALS);
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return createSuccess({ message: 'Password updated successfully' });
        } catch (error) {
            Logger.error('Error in changePassword:', error);
            throw error;
        }
    }

    async deleteAccount(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return createError('User not found', ErrorCodes.NOT_FOUND);
            }

            await user.destroy();
            return createSuccess({ message: 'Account deleted successfully' });
        } catch (error) {
            Logger.error('Error in deleteAccount:', error);
            throw error;
        }
    }

    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user.toJSON();
        return sanitizedUser;
    }
}

module.exports = new UserService();
