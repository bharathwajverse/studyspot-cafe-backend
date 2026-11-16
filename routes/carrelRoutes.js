/**
 * Carrel Routes
 * StudySpot Cafe - Study Carrel Booking Management System
 * Connects carrel endpoints to carrelController (Member 3) and validation (Member 4).
 */

const express = require('express');
const router = express.Router();
const carrelController = require('../controllers/carrelController');
const { validateCarrel, validateIdParam } = require('../validation/carrelValidation');

router.get('/', carrelController.getAllCarrels);
router.get('/:id', validateIdParam, carrelController.getCarrelById);
router.post('/', validateCarrel, carrelController.createCarrel);
router.put('/:id', validateIdParam, validateCarrel, carrelController.updateCarrel);
router.delete('/:id', validateIdParam, carrelController.deleteCarrel);

module.exports = router;
