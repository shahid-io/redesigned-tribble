const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database.config');
const { Logger } = require('../config');

const sequelize = new Sequelize(dbConfig.url, {
    ...dbConfig,
    define: {
        timestamps: true,
        underscored: true
    }
});

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
