const app = require('./app');
const { ServerConfig, Logger } = require('./config');
const { checkDatabaseConnection } = require('./common');

async function startServer() {
    try {
        await checkDatabaseConnection();
        
        app.listen(ServerConfig.PORT, () => {
            Logger.info(`Server started on port ${ServerConfig.PORT}`);
            Logger.info(`Environment: ${ServerConfig.NODE_ENV}`);
        });
    } catch (error) {
        Logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
