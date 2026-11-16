/**
 * Centralized Error Handler Middleware
 * StudySpot Cafe - Study Carrel Booking Management System
 * Formats error responses consistently and prevents internal database leaks (Member 1 allocation).
 */

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const statusCode = err.status || err.statusCode || 500;

    // Default client-facing message
    let clientMessage = err.message || 'An unexpected server error occurred';

    // Handle malformed JSON body errors from express.json()
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        clientMessage = 'Malformed JSON in request body';
    }

    // Mask internal SQLite syntax/disk errors on 500 to protect server internals
    if (statusCode === 500 && (err.code?.startsWith('SQLITE') || /sqlite/i.test(err.message))) {
        clientMessage = 'An internal database error occurred';
    }

    const response = {
        success: false,
        message: clientMessage
    };

    if (Array.isArray(err.errors) && err.errors.length > 0) {
        response.errors = err.errors;
    }

    return res.status(statusCode).json(response);
}

module.exports = errorHandler;
