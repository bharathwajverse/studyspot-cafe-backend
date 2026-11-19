/**
 * Member 5: Automated API Test Suite
 * Tests all endpoints across Member 1, 2, 3, 4, and 5 using node:test and supertest.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

const { setupTestDb, cleanupTestDb } = require('./testSetup');
const app = require('../app');
const db = require('../database/database');

describe('StudySpot Cafe - Group 4 API Automated Test Suite', () => {

    before(async () => {
        // Prepare isolated test SQLite database
        await setupTestDb();
    });

    after(async () => {
        // Clean up test SQLite database
        await cleanupTestDb();
    });

    // ==========================================
    // 1. GENERAL ROUTING & HEALTH CHECK
    // ==========================================
    describe('General Routing & Health Check', () => {
        it('GET / should return 200 and operational status', async () => {
            const res = await request(app).get('/');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.group, 'Group 4');
        });

        it('GET /unknown-route should return 404 with standard JSON format', async () => {
            const res = await request(app).get('/unknown-endpoint');
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Resource not found/i);
        });

        it('POST /students with malformed JSON body should return 400 with clean error format', async () => {
            const res = await request(app)
                .post('/students')
                .set('Content-Type', 'application/json')
                .send('{ "name": "Invalid JSON');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Malformed JSON/i);
        });
    });

    // ==========================================
    // 2. STUDENTS API (Member 1)
    // ==========================================
    describe('Students API', () => {
        it('GET /students should retrieve all students', async () => {
            const res = await request(app).get('/students');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length >= 5);
        });

        it('GET /students/:id should retrieve a single student by ID', async () => {
            const res = await request(app).get('/students/1');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.id, 1);
            assert.strictEqual(res.body.data.name, 'Alice Johnson');
        });

        it('GET /students/:id should return 404 for a nonexistent student', async () => {
            const res = await request(app).get('/students/9999');
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.message, 'Student not found');
        });

        it('GET /students/:id should reject malformed ID "12abc" with HTTP 400', async () => {
            const res = await request(app).get('/students/12abc');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /students/:id should reject decimal ID "1.5" with HTTP 400', async () => {
            const res = await request(app).get('/students/1.5');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /students/:id should reject negative ID "-1" with HTTP 400', async () => {
            const res = await request(app).get('/students/-1');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /students/:id should reject zero ID "0" with HTTP 400', async () => {
            const res = await request(app).get('/students/0');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('POST /students should create a new student with valid data', async () => {
            const newStudent = {
                name: 'Grace Hopper',
                email: 'grace.hopper@example.com'
            };
            const res = await request(app).post('/students').send(newStudent);
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.name, 'Grace Hopper');
            assert.strictEqual(res.body.data.email, 'grace.hopper@example.com');
            assert.ok(res.body.data.id > 0);
        });

        it('POST /students should reject a student with missing name', async () => {
            const res = await request(app).post('/students').send({
                email: 'noname@example.com'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Student name is required'));
        });

        it('POST /students should reject whitespace-only name with HTTP 400', async () => {
            const res = await request(app).post('/students').send({
                name: '   ',
                email: 'whitespace@example.com'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Student name is required'));
        });

        it('POST /students should reject non-string email with HTTP 400', async () => {
            const res = await request(app).post('/students').send({
                name: 'Valid Name',
                email: 12345
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Email must be a text string'));
        });

        it('POST /students should trim leading and trailing whitespace from student name', async () => {
            const res = await request(app).post('/students').send({
                name: '  Trimmed Student  ',
                email: 'trimmed@example.com'
            });
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.name, 'Trimmed Student');
        });

        it('POST /students should reject an invalid email format', async () => {
            const res = await request(app).post('/students').send({
                name: 'Bad Email Student',
                email: 'not-an-email'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Invalid email format'));
        });
    });

    // ==========================================
    // 3. CARREL CRUD (Member 3) & VALIDATION (Member 4)
    // ==========================================
    describe('Carrel CRUD & Input Validation', () => {
        let createdCarrelId;

        it('GET /carrels should retrieve all carrels', async () => {
            const res = await request(app).get('/carrels');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length >= 10);
        });

        it('GET /carrels/:id should retrieve an individual carrel', async () => {
            const res = await request(app).get('/carrels/1');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.id, 1);
            assert.strictEqual(res.body.data.name, 'Carrel A-1');
            assert.strictEqual(res.body.data.zone, 'A');
        });

        it('GET /carrels/:id should return 404 for a nonexistent carrel', async () => {
            const res = await request(app).get('/carrels/9999');
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.message, 'Carrel not found');
        });

        it('GET /carrels/:id should reject malformed ID "12abc" with HTTP 400', async () => {
            const res = await request(app).get('/carrels/12abc');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /carrels/:id should reject decimal ID "1.5" with HTTP 400', async () => {
            const res = await request(app).get('/carrels/1.5');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /carrels/:id should reject negative ID "-1" with HTTP 400', async () => {
            const res = await request(app).get('/carrels/-1');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /carrels/:id should reject zero ID "0" with HTTP 400', async () => {
            const res = await request(app).get('/carrels/0');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /carrels/:id should reject unsafe integer ID with HTTP 400', async () => {
            const res = await request(app).get('/carrels/9999999999999999999999');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('POST /carrels should create a new carrel with valid data', async () => {
            const newCarrel = {
                name: 'Carrel D-1',
                zone: 'D'
            };
            const res = await request(app).post('/carrels').send(newCarrel);
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.name, 'Carrel D-1');
            assert.strictEqual(res.body.data.zone, 'D');
            assert.ok(res.body.data.id > 0);
            createdCarrelId = res.body.data.id;
        });

        it('PUT /carrels/:id should update an existing carrel', async () => {
            const res = await request(app).put(`/carrels/${createdCarrelId}`).send({
                name: 'Carrel D-1 Renovated',
                zone: 'D'
            });
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.name, 'Carrel D-1 Renovated');
            assert.strictEqual(res.body.data.zone, 'D');
        });

        it('PUT /carrels/:id should return 404 for nonexistent carrel ID', async () => {
            const res = await request(app).put('/carrels/9999').send({
                name: 'Ghost Carrel',
                zone: 'Z'
            });
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.message, 'Carrel not found');
        });

        it('PUT /carrels/:id should reject malformed ID "12abc" with HTTP 400', async () => {
            const res = await request(app).put('/carrels/12abc').send({
                name: 'Carrel Updated',
                zone: 'A'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('DELETE /carrels/:id should delete an existing carrel with no bookings', async () => {
            const res = await request(app).delete(`/carrels/${createdCarrelId}`);
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.message, 'Carrel deleted successfully');

            // Verify carrel is indeed gone
            const getRes = await request(app).get(`/carrels/${createdCarrelId}`);
            assert.strictEqual(getRes.status, 404);
        });

        it('DELETE /carrels/:id should return 404 for nonexistent carrel ID', async () => {
            const res = await request(app).delete('/carrels/9999');
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.message, 'Carrel not found');
        });

        it('DELETE /carrels/:id should reject malformed ID "12abc" with HTTP 400', async () => {
            const res = await request(app).delete('/carrels/12abc');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('DELETE /carrels/:id should return 409 conflict when deleting a carrel with existing bookings', async () => {
            // Carrel 1 has booking 1 in seed data
            const res = await request(app).delete('/carrels/1');
            assert.strictEqual(res.status, 409);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(
                res.body.message,
                'Cannot delete carrel: existing bookings are associated with this carrel'
            );
        });

        // Validation edge cases
        it('POST /carrels should reject missing name with HTTP 400', async () => {
            const res = await request(app).post('/carrels').send({
                zone: 'A'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Carrel name is required'));
        });

        it('POST /carrels should reject missing zone with HTTP 400', async () => {
            const res = await request(app).post('/carrels').send({
                name: 'Carrel Without Zone'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Carrel zone is required'));
        });

        it('POST /carrels should reject empty name with HTTP 400', async () => {
            const res = await request(app).post('/carrels').send({
                name: '',
                zone: 'A'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Carrel name is required'));
        });

        it('POST /carrels should reject whitespace-only values with HTTP 400', async () => {
            const res = await request(app).post('/carrels').send({
                name: '   ',
                zone: '   '
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Carrel name is required'));
            assert.ok(res.body.errors.includes('Carrel zone is required'));
        });
    });

    // ==========================================
    // 4. ZONE-BASED SEARCH (Member 4)
    // ==========================================
    describe('Zone-Based Search', () => {
        it('GET /carrels?zone=A should return only zone A carrels', async () => {
            const res = await request(app).get('/carrels?zone=A');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length > 0);
            for (const carrel of res.body.data) {
                assert.strictEqual(carrel.zone.toUpperCase(), 'A');
            }
        });

        it('GET /carrels?zone=B should return only zone B carrels', async () => {
            const res = await request(app).get('/carrels?zone=B');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length > 0);
            for (const carrel of res.body.data) {
                assert.strictEqual(carrel.zone.toUpperCase(), 'B');
            }
        });

        it('GET /carrels?zone=a (lowercase) should perform case-insensitive zone filtering', async () => {
            const res = await request(app).get('/carrels?zone=a');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length > 0);
            for (const carrel of res.body.data) {
                assert.strictEqual(carrel.zone.toUpperCase(), 'A');
            }
        });

        it('GET /carrels?zone=NonExistent should return empty array with 200', async () => {
            const res = await request(app).get('/carrels?zone=NonExistent');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.strictEqual(res.body.data.length, 0);
        });

        it('GET /carrels without zone should return all carrels', async () => {
            const res = await request(app).get('/carrels');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(res.body.data.length >= 10);
        });

        it('GET /carrels?zone= with empty zone parameter should return all carrels', async () => {
            const res = await request(app).get('/carrels?zone=');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length >= 10);
        });
    });

    // ==========================================
    // 5. SORTING (Member 4)
    // ==========================================
    describe('Ascending and Descending Sorting', () => {
        it('GET /carrels?sort=name&order=asc should return carrels in A to Z alphabetical order', async () => {
            const res = await request(app).get('/carrels?sort=name&order=asc');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            const names = res.body.data.map(c => c.name);
            const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
            assert.deepStrictEqual(names, sortedNames);
        });

        it('GET /carrels?sort=name&order=desc should return carrels in Z to A reverse alphabetical order', async () => {
            const res = await request(app).get('/carrels?sort=name&order=desc');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            const names = res.body.data.map(c => c.name);
            const reverseSortedNames = [...names].sort((a, b) => b.localeCompare(a));
            assert.deepStrictEqual(names, reverseSortedNames);
        });

        it('GET /carrels?sort=colour should reject unsupported field with HTTP 400 and exact error message', async () => {
            const res = await request(app).get('/carrels?sort=colour');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(res.body.message, 'Cannot sort by that field');
        });

        it('GET /carrels?sort=name&order=invalid should reject invalid direction with HTTP 400', async () => {
            const res = await request(app).get('/carrels?sort=name&order=invalid');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.strictEqual(
                res.body.message,
                "Invalid sorting order. Permitted values are 'asc' or 'desc'"
            );
        });

        it('GET /carrels?zone=A&sort=name&order=asc should filter by zone and sort simultaneously', async () => {
            const res = await request(app).get('/carrels?zone=A&sort=name&order=asc');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(res.body.data.length > 0);

            // Verify zone filtering
            for (const carrel of res.body.data) {
                assert.strictEqual(carrel.zone.toUpperCase(), 'A');
            }

            // Verify sorting
            const names = res.body.data.map(c => c.name);
            const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
            assert.deepStrictEqual(names, sortedNames);
        });
    });

    // ==========================================
    // 6. BOOKINGS JOIN API (Member 5)
    // ==========================================
    describe('Bookings JOIN API', () => {
        it('GET /bookings should retrieve bookings with joined student and carrel information', async () => {
            const res = await request(app).get('/bookings');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.ok(Array.isArray(res.body.data));
            assert.ok(res.body.data.length >= 5);

            // Verify structure of joined records
            for (const booking of res.body.data) {
                assert.ok(booking.id, 'Booking must have id');
                assert.ok(booking.booking_date, 'Booking must have booking_date');
                assert.ok(booking.student_id, 'Booking must have student_id');
                assert.ok(typeof booking.student_name === 'string', 'Student name must be present from JOIN');
                assert.ok(booking.student_name.length > 0, 'Student name must not be empty');
                assert.ok(booking.carrel_id, 'Booking must have carrel_id');
                assert.ok(typeof booking.carrel_name === 'string', 'Carrel name must be present from JOIN');
                assert.ok(booking.carrel_name.length > 0, 'Carrel name must not be empty');
            }
        });

        it('GET /bookings/:id should retrieve a single joined booking', async () => {
            const res = await request(app).get('/bookings/1');
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.id, 1);
            assert.strictEqual(res.body.data.student_name, 'Alice Johnson');
            assert.strictEqual(res.body.data.carrel_name, 'Carrel A-1');
        });

        it('GET /bookings/:id should reject malformed ID "12abc" with HTTP 400', async () => {
            const res = await request(app).get('/bookings/12abc');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('GET /bookings/:id should reject decimal ID "1.5" with HTTP 400', async () => {
            const res = await request(app).get('/bookings/1.5');
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /Invalid ID parameter/i);
        });

        it('POST /bookings should create a valid booking with date-only YYYY-MM-DD', async () => {
            const newBooking = {
                student_id: 1,
                carrel_id: 3,
                booking_date: '2026-12-15'
            };
            const res = await request(app).post('/bookings').send(newBooking);
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.student_id, 1);
            assert.strictEqual(res.body.data.carrel_id, 3);
            assert.strictEqual(res.body.data.booking_date, '2026-12-15');
            assert.strictEqual(res.body.data.student_name, 'Alice Johnson');
            assert.strictEqual(res.body.data.carrel_name, 'Carrel A-3');
            assert.ok(res.body.data.id > 0);
        });

        it('POST /bookings should create a valid booking with full ISO 8601 timestamp', async () => {
            const newBooking = {
                student_id: 2,
                carrel_id: 4,
                booking_date: '2026-11-25T14:30:00Z'
            };
            const res = await request(app).post('/bookings').send(newBooking);
            assert.strictEqual(res.status, 201);
            assert.strictEqual(res.body.success, true);
            assert.strictEqual(res.body.data.student_id, 2);
            assert.strictEqual(res.body.data.carrel_id, 4);
            assert.strictEqual(res.body.data.booking_date, '2026-11-25T14:30:00Z');
        });

        it('POST /bookings should reject nonexistent student ID with HTTP 404', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 9999,
                carrel_id: 1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /student with ID 9999 does not exist/i);
        });

        it('POST /bookings should reject nonexistent carrel ID with HTTP 404', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 9999,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 404);
            assert.strictEqual(res.body.success, false);
            assert.match(res.body.message, /carrel with ID 9999 does not exist/i);
        });

        // Malformed ID validation in POST /bookings
        it('POST /bookings should reject malformed student_id "12abc" with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: '12abc',
                carrel_id: 1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid student ID is required'));
        });

        it('POST /bookings should reject decimal student_id 1.5 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1.5,
                carrel_id: 1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid student ID is required'));
        });

        it('POST /bookings should reject negative student_id -1 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: -1,
                carrel_id: 1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid student ID is required'));
        });

        it('POST /bookings should reject zero student_id 0 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 0,
                carrel_id: 1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid student ID is required'));
        });

        it('POST /bookings should reject empty student_id "" with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: '',
                carrel_id: 1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid student ID is required'));
        });

        it('POST /bookings should reject malformed carrel_id "12abc" with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: '12abc',
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid carrel ID is required'));
        });

        it('POST /bookings should reject decimal carrel_id 1.5 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1.5,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid carrel ID is required'));
        });

        it('POST /bookings should reject negative carrel_id -1 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: -1,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid carrel ID is required'));
        });

        it('POST /bookings should reject zero carrel_id 0 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 0,
                booking_date: '2026-12-16'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Valid carrel ID is required'));
        });

        // Calendar date validation & impossible dates
        it('POST /bookings should reject invalid text string date with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1,
                booking_date: 'invalid-date-string'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)'));
        });

        it('POST /bookings should reject impossible date 2026-02-30 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1,
                booking_date: '2026-02-30'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)'));
        });

        it('POST /bookings should reject impossible date 2026-02-31 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1,
                booking_date: '2026-02-31'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)'));
        });

        it('POST /bookings should reject impossible date 2026-13-01 (month 13) with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1,
                booking_date: '2026-13-01'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)'));
        });

        it('POST /bookings should reject impossible date 2026-04-31 (April has 30 days) with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1,
                booking_date: '2026-04-31'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)'));
        });

        it('POST /bookings should reject impossible leap day in non-leap year 2026-02-29 with HTTP 400', async () => {
            const res = await request(app).post('/bookings').send({
                student_id: 1,
                carrel_id: 1,
                booking_date: '2026-02-29'
            });
            assert.strictEqual(res.status, 400);
            assert.strictEqual(res.body.success, false);
            assert.ok(res.body.errors.includes('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)'));
        });
    });

    // ==========================================
    // 7. DATABASE INITIALIZATION & IDEMPOTENCY
    // ==========================================
    describe('Database Initialization & Restart Idempotency', () => {
        it('Re-running initDatabase() does not produce duplicate records on restart', async () => {
            const countBefore = await db.get('SELECT COUNT(*) as count FROM carrels');
            // Re-invoke initialization as if server restarted
            await db.initDatabase();
            const countAfter = await db.get('SELECT COUNT(*) as count FROM carrels');
            assert.strictEqual(countBefore.count, countAfter.count);
        });

        it('initDatabase() reliably seeds missing tables on partially populated database', async () => {
            // Delete bookings only to simulate partial database state
            await db.run('DELETE FROM bookings');
            const zeroBookings = await db.get('SELECT COUNT(*) as count FROM bookings');
            assert.strictEqual(zeroBookings.count, 0);

            // Re-initialize: should seed missing bookings while preserving existing students & carrels
            await db.initDatabase();
            const restoredBookings = await db.get('SELECT COUNT(*) as count FROM bookings');
            assert.ok(restoredBookings.count >= 5);
        });

        it('initDatabase() safely restores individual deleted seed records without duplicating user records', async () => {
            const countBefore = await db.get('SELECT COUNT(*) as count FROM students');

            // Remove foreign-key dependent booking before deleting student 1
            await db.run('DELETE FROM bookings WHERE student_id = 1');
            await db.run('DELETE FROM students WHERE id = 1');
            const missingStudent = await db.get('SELECT * FROM students WHERE id = 1');
            assert.strictEqual(missingStudent, undefined);

            // Re-run initDatabase: seed.sql uses INSERT OR IGNORE, restoring student 1
            await db.initDatabase();
            const restoredStudent = await db.get('SELECT * FROM students WHERE id = 1');
            assert.ok(restoredStudent);
            assert.strictEqual(restoredStudent.name, 'Alice Johnson');

            // Verify count is restored back to countBefore without creating duplicates
            const countAfter = await db.get('SELECT COUNT(*) as count FROM students');
            assert.strictEqual(countAfter.count, countBefore.count);
        });
    });

});
