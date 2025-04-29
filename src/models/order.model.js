const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');

class Order extends Model {
    static associate(models) {
        Order.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
        Order.belongsTo(models.User, { foreignKey: 'driverId', as: 'driver' });
        Order.belongsTo(models.Product, { foreignKey: 'productId' });
    }
}

Order.init({
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
    driverId: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    startLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    finishLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    orderedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders'
});

module.exports = Order;
