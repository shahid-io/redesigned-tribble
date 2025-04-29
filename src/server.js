const app = require('./app');
const { ServerConfig, Logger } = require('./config');
const { checkDatabaseConnection, syncDatabase } = require('./common/database');
const { initializeMailer } = require('./config/mail.config');

async function startServer() {
    try {
        await checkDatabaseConnection();
        if (process.env.NODE_ENV === 'development') {
            await syncDatabase();
        }
        
        await initializeMailer();
        
        const server = app.listen(ServerConfig.PORT, () => {
            Logger.info(`Server started on port ${ServerConfig.PORT}`);
            Logger.info(`Environment: ${ServerConfig.NODE_ENV}`);
        });

        const shutdown = async () => {
            Logger.info('Shutting down server...');
            server.close(() => {
                Logger.info('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
        
    } catch (error) {
        Logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
