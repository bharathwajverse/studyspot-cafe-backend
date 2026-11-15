/**
 * Carrel Validation Middleware
 * StudySpot Cafe - Study Carrel Booking Management System
 * Validates request bodies for carrel creation/update and numeric ID parameters (Member 4 allocation).
 */

function validateCarrel(req, res, next) {
    const { name, zone } = req.body;
    const errors = [];

    // Validate name
    if (name === undefined || name === null || (typeof name === 'string' && name.trim() === '')) {
        errors.push('Carrel name is required');
    } else if (typeof name !== 'string') {
        errors.push('Carrel name must be a text string');
    }

    // Validate zone
    if (zone === undefined || zone === null || (typeof zone === 'string' && zone.trim() === '')) {
        errors.push('Carrel zone is required');
    } else if (typeof zone !== 'string') {
        errors.push('Carrel zone must be a text string');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Clean whitespace
    req.body.name = req.body.name.trim();
    req.body.zone = req.body.zone.trim();

    next();
}

/**
 * Validates route parameter :id to ensure it is a valid positive integer.
 * Rejects malformed IDs such as '12abc', '1.5', '-1', '0', empty strings.
 */
function validateIdParam(req, res, next) {
    const rawId = req.params.id;

    if (!rawId || typeof rawId !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID parameter. ID must be a positive integer'
        });
    }

    const trimmed = rawId.trim();

    // Only allow positive integers: digits 1-9 followed by 0-9 digits (rejects decimals, letters, negatives, zero, leading zeroes)
    if (!/^[1-9]\d*$/.test(trimmed)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID parameter. ID must be a positive integer'
        });
    }

    const id = parseInt(trimmed, 10);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID parameter. ID must be a positive integer'
        });
    }

    req.params.id = id;
    next();
}

module.exports = {
    validateCarrel,
    validateIdParam
};
