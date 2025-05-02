const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');

/**
 * OTP Model
 * Represents One-Time Password entries for user verification
 */
class OTP extends Model {}

/**
 * OTP model definition
 * @property {UUID} id - Unique identifier for the OTP
 * @property {UUID} userId - Associated user ID
 * @property {string} code - 6-digit OTP code
 * @property {Date} expiresAt - OTP expiration timestamp
 * @property {boolean} isUsed - Whether OTP has been used
 */
OTP.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    code: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'OTP',
    tableName: 'otps'
});

module.exports = OTP;
