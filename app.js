/**
 * Express Application Configuration
 * StudySpot Cafe - Study Carrel Booking Management System
 * Configures middleware, mounts resource routes, and handles 404 / global errors.
 */

const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const carrelRoutes = require('./routes/carrelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notFoundHandler = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON payloads
app.use(express.json());

// Base health check / system status route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'StudySpot Cafe API is operational',
        group: 'Group 4',
        course: 'Backend Development Fundamentals'
    });
});

// Register API resource routes
app.use('/students', studentRoutes);
app.use('/carrels', carrelRoutes);
app.use('/bookings', bookingRoutes);

// Catch-all 404 handler for undefined endpoints
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
