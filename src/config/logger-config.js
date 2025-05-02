const winston = require('winston');

/**
 * Winston Logger Configuration
 * Configures logging for different environments with file and console transport
 * 
 * @module LoggerConfig
 */

/**
 * Create Winston logger instance with:
 * - Console logging for all environments
 * - File logging for errors
 * - Combined logging file for all levels
 * - Timestamp and color formatting
 */
const Logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

module.exports = Logger;
