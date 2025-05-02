const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');

/**
 * Product Model
 * Represents available service products in the system
 */
class Product extends Model {}

/**
 * Product model definition
 * @property {UUID} id - Unique identifier for the product
 * @property {string} name - Product name
 * @property {enum} type - Product type: 'simple', 'comfortable', or 'elite'
 * @property {decimal} basePrice - Base price for the product
 * @property {string} description - Product description
 * @property {Object} features - JSON object containing product features
 * @property {boolean} isActive - Product availability status
 */
Product.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('simple', 'comfortable', 'elite'),
        allowNull: false
    },
    basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    features: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products'
});

module.exports = Product;
