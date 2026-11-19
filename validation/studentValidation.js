/**
 * Student Validation Middleware
 * StudySpot Cafe - Study Carrel Booking Management System
 * Validates request body for student creation (Member 4 allocation).
 */

function validateStudent(req, res, next) {
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: ['Request body must be a valid JSON object']
        });
    }

    const { name, email } = req.body;
    const errors = [];

    // Validate name
    if (name === undefined || name === null || (typeof name === 'string' && name.trim() === '')) {
        errors.push('Student name is required');
    } else if (typeof name !== 'string') {
        errors.push('Student name must be a text string');
    }

    // Validate email (optional)
    if (email !== undefined && email !== null && email !== '') {
        if (typeof email !== 'string') {
            errors.push('Email must be a text string');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                errors.push('Invalid email format');
            }
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    req.body.name = req.body.name.trim();
    if (req.body.email && typeof req.body.email === 'string') {
        req.body.email = req.body.email.trim();
    }

    next();
}

module.exports = {
    validateStudent
};
