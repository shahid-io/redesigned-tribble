const express = require('express');
const cors = require('cors');
const { Logger } = require('./config');
const v1Routes = require('./routes/v1');
const { errorHandler } = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Logging middleware
 */
app.use((req, res, next) => {
    Logger.info(`${req.method} ${req.url}`);
    next();
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.use('/api/v1', v1Routes);

/**
 * 404 handler
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
 * Global error handler
 */
app.use(errorHandler);

module.exports = app;
