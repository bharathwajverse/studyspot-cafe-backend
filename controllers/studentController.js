/**
 * Student Controller
 * StudySpot Cafe - Study Carrel Booking Management System
 * Implements Student API operations (GET all, GET by ID, and POST) for students (Member 1 allocation).
 */

const db = require('../database/database');

/**
 * Retrieve all students
 * GET /students
 */
async function getAllStudents(req, res, next) {
    try {
        const students = await db.query('SELECT id, name, email FROM students ORDER BY id ASC');
        return res.status(200).json({
            success: true,
            message: 'Students retrieved successfully',
            data: students
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieve a student by ID
 * GET /students/:id
 */
async function getStudentById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const student = await db.get('SELECT id, name, email FROM students WHERE id = ?', [id]);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student retrieved successfully',
            data: student
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Create a new student
 * POST /students
 */
async function createStudent(req, res, next) {
    try {
        const { name, email } = req.body;
        const result = await db.run(
            'INSERT INTO students (name, email) VALUES (?, ?)',
            [name, email || null]
        );

        return res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                id: result.lastID,
                name,
                email: email || null
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent
};

