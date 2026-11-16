/**
 * Booking Routes
 * StudySpot Cafe - Study Carrel Booking Management System
 * Connects booking endpoints to bookingController (Member 5) and validation (Member 4).
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { validateBooking } = require('../validation/bookingValidation');
const { validateIdParam } = require('../validation/carrelValidation');

router.get('/', bookingController.getAllBookings);
router.get('/:id', validateIdParam, bookingController.getBookingById);
router.post('/', validateBooking, bookingController.createBooking);

module.exports = router;

