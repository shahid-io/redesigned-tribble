const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');
const bcrypt = require('bcrypt');

class User extends Model {
    static associate(models) {
        User.hasMany(models.OTP, { foreignKey: 'userId' });
        User.hasMany(models.Order, { foreignKey: 'userId', as: 'customerOrders' });
        User.hasMany(models.Order, { foreignKey: 'driverId', as: 'driverOrders' });
    }
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

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
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

module.exports = User;
