const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../common/database');

/**
 * Product Model
 * @class Product
 * @extends Model
 * @description Represents available service products in the system
 * 
 * Features:
 * - UUID primary key for global uniqueness
 * - Product categorization by type (simple/comfortable/elite)
 * - Soft deletion support via isActive flag
 * - JSON storage for flexible feature sets
 * - Price handling with decimal precision
 * 
 * Usage:
 * ```js
 * const product = await Product.create({
 *   name: 'Premium Ride',
 *   type: 'elite',
 *   basePrice: 99.99,
 *   features: { maxDistance: 100, priority: true }
 * });
 * ```
 */
class Product extends Model {}

/**
 * Product Schema Definition
 * @typedef {Object} ProductAttributes
 * @property {UUID} id - Unique identifier for the product
 * @property {string} name - Product name (required)
 * @property {enum} type - Product type: 'simple', 'comfortable', or 'elite' (required)
 * @property {decimal} basePrice - Base price for the product (required)
 * @property {string} [description] - Optional product description
 * @property {Object} features - JSON object containing product features
 * @property {boolean} isActive - Product availability status (defaults to true)
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Record last update timestamp
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
