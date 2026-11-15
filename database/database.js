/**
 * Database Management Module
 * StudySpot Cafe - Study Carrel Booking Management System
 * SQLite connection singleton, query helpers, and lifecycle management (Member 2 allocation).
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

let dbInstance = null;
let currentDbPath = null;

/**
 * Resolves the database path using environment variable DB_PATH or default location.
 */
function getDefaultDbPath() {
    return process.env.DB_PATH || path.join(__dirname, 'data', 'studyspot.db');
}

/**
 * Gets or creates the SQLite database connection singleton.
 * Configures PRAGMA foreign_keys = ON.
 * @param {string|null} dbPath - Optional path to the database file.
 * @returns {sqlite3.Database}
 */
function getDb(dbPath = null) {
    const targetPath = dbPath || currentDbPath || getDefaultDbPath();

    if (dbInstance && currentDbPath === targetPath) {
        return dbInstance;
    }

    if (dbInstance) {
        try {
            dbInstance.close();
        } catch {
            // Ignore close errors when switching paths
        }
        dbInstance = null;
    }

    if (targetPath !== ':memory:') {
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    currentDbPath = targetPath;
    dbInstance = new sqlite3.Database(targetPath);
    dbInstance.run('PRAGMA foreign_keys = ON;');
    return dbInstance;
}

/**
 * Execute an SQL query returning all matching rows.
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Array>}
 */
function query(sql, params = []) {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Execute an SQL query returning a single row.
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Object|undefined>}
 */
function get(sql, params = []) {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

/**
 * Execute an SQL INSERT, UPDATE, or DELETE statement.
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<{lastID: number, changes: number}>}
 */
function run(sql, params = []) {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

/**
 * Execute a multi-statement SQL script.
 * @param {string} sql 
 * @returns {Promise<void>}
 */
function exec(sql) {
    const db = getDb();
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

/**
 * Initializes the database tables and populates sample seed records if empty or partially populated.
 * Prevents duplicate sample records after server restarts.
 * @param {string|null} customPath 
 * @param {boolean} forceSeed 
 * @returns {Promise<sqlite3.Database>}
 */
async function initDatabase(customPath = null, forceSeed = false) {
    const db = getDb(customPath);

    // Enforce foreign key constraints
    await new Promise((resolve, reject) => {
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    // Execute schema.sql to ensure all required tables exist
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await exec(schemaSql);

    // Verify whether seed data already exists across tables
    const studentCountRow = await get('SELECT COUNT(*) as count FROM students');
    const carrelCountRow = await get('SELECT COUNT(*) as count FROM carrels');
    const bookingCountRow = await get('SELECT COUNT(*) as count FROM bookings');

    const studentsCount = studentCountRow ? studentCountRow.count : 0;
    const carrelsCount = carrelCountRow ? carrelCountRow.count : 0;
    const bookingsCount = bookingCountRow ? bookingCountRow.count : 0;

    // Trigger seeding for fresh databases (all empty) or partially populated databases (any empty)
    const needsSeed = (studentsCount === 0 || carrelsCount === 0 || bookingsCount === 0);

    if (needsSeed || forceSeed) {
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await exec(seedSql);
    }

    return db;
}

/**
 * Closes active database connection.
 * @returns {Promise<void>}
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (!dbInstance) {
            return resolve();
        }
        dbInstance.close((err) => {
            if (err) return reject(err);
            dbInstance = null;
            currentDbPath = null;
            resolve();
        });
    });
}

module.exports = {
    getDb,
    query,
    get,
    run,
    exec,
    initDatabase,
    closeDatabase
};
