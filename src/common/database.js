/**
 * Database Connection Module
 * @module Database
 * @description Manages database connection, synchronization, and health checks
 * 
 * @requires sequelize - ORM for database operations
 * @requires dbConfig - Database configuration
 * @requires Logger - Application logging utility
 */
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database.config');
const { Logger } = require('../config');

/**
 * Sequelize instance configuration
 * @description Initializes database connection with logging and pool settings
 * 
 * Features:
 * - Connection pooling
 * - Debug logging
 * - PostgreSQL dialect
 */
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: 'postgres',
        logging: (msg) => Logger.debug(msg),
        pool: dbConfig.pool
    }
);

/**
 * Synchronize Database Schema
 * @description Updates database schema in development environment
 * 
 * Features:
 * - Safe schema updates using ALTER
 * - Temporary disable of foreign key checks
 * - Development environment protection
 * 
 * @async
 * @function syncDatabase
 * @throws {Error} If synchronization fails
 * @returns {Promise<void>}
 */
const syncDatabase = async () => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await sequelize.query('SET session_replication_role = replica;');
            // await sequelize.sync({ force: true });
            await sequelize.sync({ alter: true });
            await sequelize.query('SET session_replication_role = DEFAULT;');
            Logger.info('Database synced successfully');
        }
    } catch (error) {
        Logger.error('Database sync failed:', error);
        throw error;
    }
};

/**
 * Verify Database Connection
 * @description Tests database connectivity on startup
 * 
 * Features:
 * - Connection testing
 * - Detailed error logging
 * - Health check support
 * 
 * @async
 * @function checkDatabaseConnection
 * @throws {Error} If connection fails
 * @returns {Promise<void>}
 */
const checkDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        Logger.info('Database connection established successfully.');
    } catch (error) {
        Logger.error('Unable to connect to the database:', error);
        throw error;
    }
};

/**
 * Export database utilities
 * @exports {Object} Database utilities
 * @property {Sequelize} sequelize - Sequelize instance
 * @property {Function} checkDatabaseConnection - Connection verification
 * @property {Function} syncDatabase - Schema synchronization
 */
module.exports = {
    sequelize,
    checkDatabaseConnection,
    syncDatabase
};
