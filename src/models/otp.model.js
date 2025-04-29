const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');

class OTP extends Model {}

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
