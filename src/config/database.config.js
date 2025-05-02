/**
 * Database Configuration Module
 * @module DatabaseConfig
 * @description Manages database connection settings for different environments
 * 
 * @requires ServerConfig - Server configuration utilities
 */
const { ServerConfig } = require('./index');

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} username - Database user
 * @property {string} password - Database password
 * @property {string} database - Database name
 * @property {string} host - Database host
 * @property {number} port - Database port
 * @property {string} dialect - Database type (postgres)
 * @property {Function} logging - Query logging function
 * @property {Object} define - Model definition defaults
 */

/**
 * Environment-specific database configurations
 * 
 * Development Configuration:
 * - Local PostgreSQL instance
 * - Console logging enabled
 * - Timestamp columns enabled
 * - Camelcase naming strategy
 * 
 * @type {Object.<string, DatabaseConfig>}
 */
const config = {
  development: {
    username: process.env.DEV_DB_USERNAME || 'postgres',
    password: process.env.DEV_DB_PASSWORD || 'root',
    database: process.env.DEV_DB_DATABASE || 'redesigned-tribble',
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false
    }
  }
};

/**
 * Export environment-specific configuration
 * Defaults to development if NODE_ENV is not set
 */
module.exports = config[process.env.NODE_ENV || 'development'];
