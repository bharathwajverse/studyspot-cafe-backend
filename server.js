/**
 * Server Entrypoint
 * StudySpot Cafe - Study Carrel Booking Management System
 * Initializes the SQLite database and starts listening on the configured port.
 */

const app = require('./app');
const { initDatabase, closeDatabase } = require('./database/database');

async function startServer() {
    const port = process.env.PORT || 3000;

    try {
        console.log('Initializing SQLite database...');
        await initDatabase();
        console.log('Database schema and seed data verified.');

        const server = app.listen(port, () => {
            console.log(`StudySpot Cafe server is running on port ${port}`);
            console.log(`Base URL: http://localhost:${port}`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = async () => {
            console.log('\nShutting down server gracefully...');
            server.close(async () => {
                await closeDatabase();
                console.log('Database connection closed. Exiting process.');
                process.exit(0);
            });
        };

        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);

        return server;
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { startServer };
