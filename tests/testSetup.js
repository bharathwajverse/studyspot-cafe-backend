/**
 * Automated Test Setup
 * StudySpot Cafe - Study Carrel Booking Management System
 * Manages an isolated temporary SQLite database for testing (Member 5 allocation).
 * Guarantees zero side-effects on the development database.
 */

const path = require('path');
const fs = require('fs');

const testDbPath = path.join(__dirname, 'test_studyspot.db');

// Ensure DB_PATH points to the isolated test database
process.env.DB_PATH = testDbPath;
process.env.PORT = '3001';

const { initDatabase, closeDatabase } = require('../database/database');

/**
 * Initializes the clean test database with schema and seed data.
 */
async function setupTestDb() {
    // Delete old test db if it exists
    if (fs.existsSync(testDbPath)) {
        try {
            fs.unlinkSync(testDbPath);
        } catch {
            // Ignore if busy
        }
    }
    await initDatabase(testDbPath, true);
}

/**
 * Closes the database and deletes the temporary test database file.
 */
async function cleanupTestDb() {
    await closeDatabase();
    if (fs.existsSync(testDbPath)) {
        try {
            fs.unlinkSync(testDbPath);
        } catch {
            // Ignore unlink errors on Windows file locks
        }
    }
}

module.exports = {
    testDbPath,
    setupTestDb,
    cleanupTestDb
};
