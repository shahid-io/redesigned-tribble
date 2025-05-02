/**
 * User Model
 * Represents a user in the system with authentication and profile capabilities
 */

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');
const bcrypt = require('bcrypt');

class User extends Model {
    /**
     * Associate models with User
     * @param {Object} models - All models in the system
     */
    static associate(models) {
        User.hasMany(models.OTP, { foreignKey: 'userId' });
        User.hasMany(models.Order, { foreignKey: 'userId', as: 'customerOrders' });
        User.hasMany(models.Order, { foreignKey: 'driverId', as: 'driverOrders' });
    }

    /**
     * Validate user password
     * @param {string} password - Plain text password
     * @returns {Promise<boolean>} - True if password matches, false otherwise
     */
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

/**
 * User model definition
 * @property {UUID} id - Unique identifier for the user
 * @property {string} email - User's email address (unique)
 * @property {string} password - Hashed password
 * @property {string} name - User's full name
 * @property {enum} role - User role: 'admin', 'driver', or 'client'
 * @property {string} country - User's country
 * @property {boolean} isVerified - Email verification status
 * @property {Date} lastLoginAt - Last login timestamp
 * @property {string} profileImage - URL to user's profile image
 * @property {string} phoneNumber - User's contact number
 * @property {enum} status - Account status: 'active', 'inactive', or 'suspended'
 * @property {decimal} earnings - User's earnings (for drivers)
 */
User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'driver', 'client'),
        defaultValue: 'client'
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLoginAt: {
        type: DataTypes.DATE
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    },
    earnings: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: false, // Change to false to use camelCase
    hooks: {
        /**
         * Hash password before creating user
         * @param {Object} user - User instance being created
         */
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

module.exports = User;
