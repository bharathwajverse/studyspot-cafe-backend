/**
 * Carrel Sorting Utility Module
 * StudySpot Cafe - Study Carrel Booking Management System
 * Implements allowlist validation and deterministic sorting for carrel queries (Member 4 allocation).
 */

const ALLOWED_SORT_FIELDS = ['name'];
const ALLOWED_ORDERS = ['asc', 'desc'];

/**
 * Validates sorting parameters and constructs deterministic SQL ORDER BY clause.
 * @param {Object} query - Express req.query object
 * @returns {{ orderClause?: string, error?: { status: number, message: string } }}
 */
function buildSortClause(query) {
    if (!query) {
        return { orderClause: 'ORDER BY id ASC' };
    }

    const { sort, order } = query;

    // If no sort field requested
    if (sort === undefined || sort === null || String(sort).trim() === '') {
        // If an order is supplied without a sort field, reject or default
        if (order !== undefined && order !== null && String(order).trim() !== '') {
            const normalizedOrder = String(order).trim().toLowerCase();
            if (!ALLOWED_ORDERS.includes(normalizedOrder)) {
                return {
                    error: {
                        status: 400,
                        message: "Invalid sorting order. Permitted values are 'asc' or 'desc'"
                    }
                };
            }
        }
        return { orderClause: 'ORDER BY id ASC' };
    }

    const normalizedSort = String(sort).trim().toLowerCase();

    // Validate sort field against strict allowlist (Group 4 Special Requirement: 'colour' returns exact error)
    if (!ALLOWED_SORT_FIELDS.includes(normalizedSort)) {
        return {
            error: {
                status: 400,
                message: 'Cannot sort by that field'
            }
        };
    }

    // Validate sorting direction (default: asc)
    let direction = 'asc';
    if (order !== undefined && order !== null && String(order).trim() !== '') {
        const normalizedOrder = String(order).trim().toLowerCase();
        if (!ALLOWED_ORDERS.includes(normalizedOrder)) {
            return {
                error: {
                    status: 400,
                    message: "Invalid sorting order. Permitted values are 'asc' or 'desc'"
                }
            };
        }
        direction = normalizedOrder;
    }

    // Map allowlisted field safely to avoid raw SQL injection; add id for determinism
    const column = 'name';
    const orderDirection = direction.toUpperCase();

    return {
        orderClause: `ORDER BY ${column} ${orderDirection}, id ASC`
    };
}

module.exports = {
    ALLOWED_SORT_FIELDS,
    ALLOWED_ORDERS,
    buildSortClause
};

