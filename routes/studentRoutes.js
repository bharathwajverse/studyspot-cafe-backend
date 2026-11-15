/**
 * Student Routes
 * StudySpot Cafe - Study Carrel Booking Management System
 * Defines student API routes and maps to studentController and validation (Member 1 allocation).
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validateStudent } = require('../validation/studentValidation');
const { validateIdParam } = require('../validation/carrelValidation');

router.get('/', studentController.getAllStudents);
router.get('/:id', validateIdParam, studentController.getStudentById);
router.post('/', validateStudent, studentController.createStudent);

module.exports = router;
