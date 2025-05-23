const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'Hello, World',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h'
};