/**
 * Booking Validation Middleware
 * StudySpot Cafe - Study Carrel Booking Management System
 * Enforces positive integer IDs and genuine calendar dates (Member 4 allocation).
 */

/**
 * Checks whether a given value represents a valid positive integer.
 * Rejects floats, strings with non-digits, negative numbers, 0, and empty strings.
 */
function isPositiveInteger(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'number') {
        return Number.isSafeInteger(value) && value > 0;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return /^[1-9]\d*$/.test(trimmed) && Number.isSafeInteger(Number(trimmed));
    }
    return false;
}

/**
 * Verifies whether year, month, and day form a valid calendar date.
 * Accurately accounts for leap years and month lengths.
 */
function isValidCalendarDate(year, month, day) {
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInMonth = [0, 31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (day > daysInMonth[month]) return false;

    const dateObj = new Date(Date.UTC(year, month - 1, day));
    return (
        dateObj.getUTCFullYear() === year &&
        dateObj.getUTCMonth() === month - 1 &&
        dateObj.getUTCDate() === day
    );
}

/**
 * Validates a booking date string.
 * Supports date-only (YYYY-MM-DD) and full ISO 8601 timestamps (YYYY-MM-DDTHH:mm:ss...).
 * Strictly checks real calendar validity (rejecting impossible dates like Feb 30, April 31, month 13).
 */
function isValidBookingDate(dateStr) {
    if (typeof dateStr !== 'string') return false;
    const trimmed = dateStr.trim();
    if (!trimmed) return false;

    // Pattern 1: Date-only YYYY-MM-DD
    const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
        const year = parseInt(dateOnlyMatch[1], 10);
        const month = parseInt(dateOnlyMatch[2], 10);
        const day = parseInt(dateOnlyMatch[3], 10);
        return isValidCalendarDate(year, month, day);
    }

    // Pattern 2: Full ISO 8601 timestamp YYYY-MM-DDTHH:mm:ss(.sss)?(Z|[+-]HH:mm)
    const isoTimestampMatch = trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})$/
    );
    if (isoTimestampMatch) {
        const year = parseInt(isoTimestampMatch[1], 10);
        const month = parseInt(isoTimestampMatch[2], 10);
        const day = parseInt(isoTimestampMatch[3], 10);
        const hours = parseInt(isoTimestampMatch[4], 10);
        const minutes = parseInt(isoTimestampMatch[5], 10);
        const seconds = parseInt(isoTimestampMatch[6], 10);

        if (!isValidCalendarDate(year, month, day)) return false;
        if (hours > 23 || minutes > 59 || seconds > 59) return false;

        const parsed = new Date(trimmed);
        return !isNaN(parsed.getTime());
    }

    return false;
}

function validateBooking(req, res, next) {
    const { student_id, carrel_id, booking_date } = req.body;
    const errors = [];

    // Validate student_id
    if (!isPositiveInteger(student_id)) {
        errors.push('Valid student ID is required');
    }

    // Validate carrel_id
    if (!isPositiveInteger(carrel_id)) {
        errors.push('Valid carrel ID is required');
    }

    // Validate booking_date
    if (!booking_date || typeof booking_date !== 'string' || booking_date.trim() === '') {
        errors.push('Booking date is required');
    } else if (!isValidBookingDate(booking_date)) {
        errors.push('Booking date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Clean validated values
    req.body.student_id = typeof student_id === 'number' ? student_id : parseInt(student_id.trim(), 10);
    req.body.carrel_id = typeof carrel_id === 'number' ? carrel_id : parseInt(carrel_id.trim(), 10);
    req.body.booking_date = booking_date.trim();

    next();
}

module.exports = {
    validateBooking,
    isPositiveInteger,
    isValidBookingDate,
    isValidCalendarDate
};
