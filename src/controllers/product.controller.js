const { StatusCodes, createSuccess, createError, ErrorCodes } = require('../types/response');
const { ProductService } = require('../services');
const { Logger } = require('../config');

/**
 * Product Controller
 * @class ProductController
 * @description Handles HTTP requests for product operations
 */
class ProductController {
    /**
     * Create a new product
     * @async
     * @param {Request} req - Express request object
     * @param {Object} req.body - Product data
     * @param {string} req.body.name - Product name
     * @param {string} req.body.type - Product type
     * @param {number} req.body.basePrice - Product base price
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response
     */
    async createProduct(req, res, next) {
        try {
            const response = await ProductService.createProduct(req.body);
            return res.status(StatusCodes.CREATED).json(response);
        } catch (error) {
            Logger.error('Error in createProduct:', error);
            next(error);
        }
    }

    /**
     * Get all active products
     * @async
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with products array
     */
    async getProducts(req, res, next) {
        try {
            const response = await ProductService.getProducts();
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in getProducts:', error);
            next(error);
        }
    }

    /**
     * Get product by ID
     * @async
     * @param {Request} req - Express request object
     * @param {string} req.params.id - Product ID
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with product data
     */
    async getProductById(req, res, next) {
        try {
            const response = await ProductService.getProductById(req.params.id);
            if (!response.success) {
                return res.status(StatusCodes.NOT_FOUND).json(response);
            }
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in getProductById:', error);
            next(error);
        }
    }

    /**
     * Update product by ID
     * @async
     * @param {Request} req - Express request object
     * @param {string} req.params.id - Product ID
     * @param {Object} req.body - Update data
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with updated product
     */
    async updateProduct(req, res, next) {
        try {
            const response = await ProductService.updateProduct(req.params.id, req.body);
            if (!response.success) {
                return res.status(StatusCodes.NOT_FOUND).json(response);
            }
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in updateProduct:', error);
            next(error);
        }
    }

    /**
     * Delete product by ID (soft delete)
     * @async
     * @param {Request} req - Express request object
     * @param {string} req.params.id - Product ID
     * @param {Response} res - Express response object
     * @param {NextFunction} next - Express next middleware
     * @returns {Promise<Response>} JSON response with deletion status
     */
    async deleteProduct(req, res, next) {
        try {
            const response = await ProductService.deleteProduct(req.params.id);
            if (!response.success) {
                return res.status(StatusCodes.NOT_FOUND).json(response);
            }
            return res.status(StatusCodes.OK).json(response);
        } catch (error) {
            Logger.error('Error in deleteProduct:', error);
            next(error);
        }
    }
}

module.exports = new ProductController();
