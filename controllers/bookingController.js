/**
 * Booking Controller
 * StudySpot Cafe - Study Carrel Booking Management System
 * Implements SQL JOIN queries for bookings and foreign key validation (Member 5 allocation).
 */

const db = require('../database/database');

/**
 * Retrieve all bookings joined with student and carrel details using SQL JOIN.
 * GET /bookings
 */
async function getAllBookings(req, res, next) {
    try {
        const sql = `
            SELECT 
                b.id AS id,
                b.booking_date AS booking_date,
                b.student_id AS student_id,
                s.name AS student_name,
                b.carrel_id AS carrel_id,
                c.name AS carrel_name
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            JOIN carrels c ON b.carrel_id = c.id
            ORDER BY b.id ASC
        `.trim();

        const bookings = await db.all(sql);

        return res.status(200).json({
            success: true,
            message: 'Bookings retrieved successfully',
            data: bookings
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieve a specific booking by ID joined with student and carrel details.
 * GET /bookings/:id
 */
async function getBookingById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const sql = `
            SELECT 
                b.id AS id,
                b.booking_date AS booking_date,
                b.student_id AS student_id,
                s.name AS student_name,
                b.carrel_id AS carrel_id,
                c.name AS carrel_name
            FROM bookings b
            JOIN students s ON b.student_id = s.id
            JOIN carrels c ON b.carrel_id = c.id
            WHERE b.id = ?
        `.trim();

        const booking = await db.get(sql, [id]);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Booking retrieved successfully',
            data: booking
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Create a new booking after validating referenced student and carrel IDs.
 * POST /bookings
 */
async function createBooking(req, res, next) {
    try {
        const { student_id, carrel_id, booking_date } = req.body;

        // Verify referenced student exists in SQLite database
        const student = await db.get('SELECT id, name FROM students WHERE id = ?', [student_id]);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Referenced student with ID ${student_id} does not exist`
            });
        }

        // Verify referenced carrel exists in SQLite database
        const carrel = await db.get('SELECT id, name FROM carrels WHERE id = ?', [carrel_id]);
        if (!carrel) {
            return res.status(404).json({
                success: false,
                message: `Referenced carrel with ID ${carrel_id} does not exist`
            });
        }

        const result = await db.run(
            'INSERT INTO bookings (student_id, carrel_id, booking_date) VALUES (?, ?, ?)',
            [student_id, carrel_id, booking_date]
        );

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                id: result.lastID,
                student_id,
                student_name: student.name,
                carrel_id,
                carrel_name: carrel.name,
                booking_date
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking
};

