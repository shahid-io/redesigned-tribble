const express = require('express');
const cors = require('cors');
const { Logger } = require('./config');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    Logger.info(`${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.use('/api', apiRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND'
        }
    });
});

app.use((err, req, res, next) => {
    Logger.error('Error:', err);
    errorHandler(err, req, res, next);
});

module.exports = app;
