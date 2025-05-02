/**
 * Server Entry Point
 * @module Server
 * @description Initializes and manages the Express application server
 * 
 * Features:
 * - Database connection verification
 * - Schema synchronization
 * - Email service initialization
 * - Graceful shutdown handling
 * 
 * @requires app - Express application instance
 * @requires ServerConfig - Server configuration
 * @requires Logger - Application logging
 * @requires database - Database utilities
 * @requires mail-config - Email service configuration
 */
const app = require('./app');
const { ServerConfig, Logger } = require('./config');
const { checkDatabaseConnection, syncDatabase } = require('./common/database');
const { initializeMailer } = require('./config/mail-config');

/**
 * Initialize and Start Server
 * @description Performs necessary startup checks and initializations
 * 
 * Startup Sequence:
 * 1. Verify database connection
 * 2. Sync database schema (development only)
 * 3. Initialize email service
 * 4. Start HTTP server
 * 5. Setup shutdown handlers
 * 
 * @async
 * @function startServer
 * @throws {Error} If critical services fail to initialize
 * @returns {Promise<void>}
 */
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

/**
 * Bootstrap Application
 * @description Initiates the server startup sequence
 */
startServer();
