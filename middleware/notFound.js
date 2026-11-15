/**
 * Not Found Middleware
 * StudySpot Cafe - Study Carrel Booking Management System
 * Handles requests to undefined routes with uniform HTTP 404 response (Member 1 allocation).
 */

function notFoundHandler(req, res, next) {
    return res.status(404).json({
        success: false,
        message: `Resource not found: ${req.method} ${req.originalUrl}`
    });
}

module.exports = notFoundHandler;
