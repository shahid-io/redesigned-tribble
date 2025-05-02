const { Product } = require('../models');
const { Logger } = require('../config');
const { createSuccess, createError } = require('../types/response');

/**
 * Product Service
 * @class ProductService
 * @description Handles business logic for product operations including:
 * - Product creation and validation
 * - Product retrieval and filtering
 * - Product updates and soft deletion
 * - Error handling and logging
 * 
 * @requires models/Product - Product database model
 * @requires config/Logger - Application logging utility
 * @requires types/response - Response formatting utilities
 */
class ProductService {
    /**
     * Create a new product
     * @async
     * @param {Object} productData - Product creation data
     * @param {string} productData.name - Product name
     * @param {('simple'|'comfortable'|'elite')} productData.type - Product type
     * @param {number} productData.basePrice - Product base price
     * @param {string} [productData.description] - Optional product description
     * @param {Object} [productData.features] - Optional product features
     * @returns {Promise<AppSuccess>} Created product data
     * @throws {Error} Database or validation errors
     */
    async createProduct(productData) {
        try {
            const product = await Product.create(productData);
            return createSuccess(product);
        } catch (error) {
            Logger.error('Error in createProduct:', error);
            throw error;
        }
    }

    /**
     * Retrieve all active products
     * @async
     * @description Fetches all products that haven't been soft-deleted
     * @returns {Promise<AppSuccess>} List of active products
     * @throws {Error} Database query errors
     */
    async getProducts() {
        try {
            const products = await Product.findAll({
                where: { isActive: true }
            });
            return createSuccess(products);
        } catch (error) {
            Logger.error('Error in getProducts:', error);
            throw error;
        }
    }

    /**
     * Find product by ID
     * @async
     * @param {string} id - UUID of the product
     * @returns {Promise<AppSuccess|AppError>} Product data or error if not found
     * @throws {Error} Database query errors
     */
    async getProductById(id) {
        try {
            const product = await Product.findOne({
                where: { id, isActive: true }
            });
            
            if (!product) {
                return createError('Product not found');
            }

            return createSuccess(product);
        } catch (error) {
            Logger.error('Error in getProductById:', error);
            throw error;
        }
    }

    /**
     * Update product information
     * @async
     * @param {string} id - UUID of the product to update
     * @param {Object} updateData - Fields to update
     * @param {string} [updateData.name] - New product name
     * @param {('simple'|'comfortable'|'elite')} [updateData.type] - New product type
     * @param {number} [updateData.basePrice] - New base price
     * @param {string} [updateData.description] - New description
     * @param {Object} [updateData.features] - New features object
     * @returns {Promise<AppSuccess|AppError>} Updated product or error if not found
     * @throws {Error} Database or validation errors
     */
    async updateProduct(id, updateData) {
        try {
            const product = await Product.findByPk(id);
            
            if (!product) {
                return createError('Product not found');
            }

            await product.update(updateData);
            return createSuccess(product);
        } catch (error) {
            Logger.error('Error in updateProduct:', error);
            throw error;
        }
    }

    /**
     * Soft delete a product
     * @async
     * @description Marks a product as inactive instead of removing from database
     * @param {string} id - UUID of the product to delete
     * @returns {Promise<AppSuccess|AppError>} Success message or error if not found
     * @throws {Error} Database operation errors
     */
    async deleteProduct(id) {
        try {
            const product = await Product.findByPk(id);
            
            if (!product) {
                return createError('Product not found');
            }

            // Soft delete by setting isActive to false
            await product.update({ isActive: false });
            return createSuccess({ message: 'Product deleted successfully' });
        } catch (error) {
            Logger.error('Error in deleteProduct:', error);
            throw error;
        }
    }
}

module.exports = new ProductService();
