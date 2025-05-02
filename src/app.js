/**
 * Required External Modules
 * @requires express - Web framework
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires Logger - Application logging utility
 * @requires apiRoutes - API route definitions
 * @requires errorHandler - Global error handling middleware
 */
const express = require('express');
const cors = require('cors');
const { Logger } = require('./config');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares');

/**
 * @description Express Application Setup
 * 
 * Features and Middleware Configuration:
 * - CORS: Enables Cross-Origin Resource Sharing
 * - Body Parser: Handles JSON and URL-encoded bodies
 * - Request Logging: Logs all incoming requests
 * - API Routes: Modular route handling
 * - Error Handling: Global error catching
 * 
 * Security Features:
 * - CORS protection
 * - Request size limits
 * - Proper error responses
 * 
 * @type {import('express').Application}
 */
const app = express();

/**
 * Global Middleware Configuration
 * @description Sets up essential middleware for all routes
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request Logging Middleware
 * @description Logs all incoming HTTP requests
 * Format: HTTP_METHOD URL
 */
app.use((req, res, next) => {
    Logger.info(`${req.method} ${req.url}`);
    next();
});

/**
 * Health Check Endpoint
 * @route GET /health
 * @description Confirms API is operational
 * @returns {Object} Status indication
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

/**
 * API Routes
 * @description Mounts all API routes under /api prefix
 */
app.use('/api', apiRoutes);

/**
 * 404 Handler
 * @description Handles undefined routes
 * @returns {Object} Error response for unknown routes
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND'
        }
    });
});

/**
 * Global Error Handler
 * @description Catches all unhandled errors
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
app.use((err, req, res, next) => {
    Logger.error('Error:', err);
    errorHandler(err, req, res, next);
});

module.exports = app;
