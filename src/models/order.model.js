const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');

/**
 * Order Model
 * Represents a ride/delivery order in the system
 */
class Order extends Model {
    /**
     * Define model associations
     * @param {Object} models - Available models
     */
    static associate(models) {
        Order.belongsTo(models.User, { foreignKey: 'userId', as: 'customer' });
        Order.belongsTo(models.User, { foreignKey: 'driverId', as: 'driver' });
        Order.belongsTo(models.Product, { foreignKey: 'productId' });
    }
}

/**
 * Order model definition
 * @property {UUID} id - Unique identifier for the order
 * @property {UUID} userId - Customer who placed the order
 * @property {UUID} driverId - Driver assigned to the order
 * @property {UUID} productId - Selected service/product
 * @property {string} startLocation - Pickup location
 * @property {string} finishLocation - Drop-off location
 * @property {decimal} amount - Order amount
 * @property {enum} status - Order status
 * @property {Date} orderedTime - Order placement time
 */
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
