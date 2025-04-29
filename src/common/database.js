const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database.config');
const { Logger } = require('../config');

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool,
        dialectOptions: dbConfig.dialectOptions,
        define: {
            timestamps: true,
            underscored: true
        }
    }
);

const checkDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        Logger.info('Database connection established successfully.');
    } catch (error) {
        Logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    checkDatabaseConnection
};
