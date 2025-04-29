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
        dialect: 'postgres',
        logging: (msg) => Logger.debug(msg),
        pool: dbConfig.pool
    }
);

const syncDatabase = async () => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await sequelize.query('SET session_replication_role = replica;'); // Disable triggers temporarily
            await sequelize.sync({ force: true });
            await sequelize.query('SET session_replication_role = DEFAULT;'); // Re-enable triggers
            Logger.info('Database synced successfully');
        }
    } catch (error) {
        Logger.error('Database sync failed:', error);
        throw error;
    }
};

const checkDatabaseConnection = async () => {
    try {
        await sequelize.authenticate();
        Logger.info('Database connection established successfully.');
    } catch (error) {
        Logger.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    checkDatabaseConnection,
    syncDatabase
};
