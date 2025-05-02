/**
 * @module ProductRoutes
 * @description Express router for product management endpoints
 * 
 * Protected Routes:
 * - All routes require authentication via authMiddleware
 * - POST and PUT operations require request body validation
 * 
 * Available Endpoints:
 * - POST /     : Create new product
 * - GET /      : List all products
 * - GET /:id   : Get product by ID
 * - PUT /:id   : Update product
 * - DELETE /:id: Soft delete product
 * 
 * @requires express - Express framework
 * @requires controllers/ProductController - Product operations handler
 * @requires middlewares/authMiddleware - Authentication verification
 * @requires middlewares/validateProduct - Product data validation
 */

const express = require('express');
const { ProductController } = require('../../controllers');
const { authMiddleware, validateProduct } = require('../../middlewares');

const router = express.Router();

// Protected routes
router.use(authMiddleware);

// CRUD routes
router.post('/', validateProduct, ProductController.createProduct);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', validateProduct, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
