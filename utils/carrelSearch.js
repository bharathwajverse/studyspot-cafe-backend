/**
 * Carrel Search Utility Module
 * StudySpot Cafe - Study Carrel Booking Management System
 * Provides zone-based filtering functionality for carrel queries (Member 4 allocation).
 */

/**
 * Builds SQL WHERE clause and parameters for zone-based search.
 * @param {Object} query - Express req.query object
 * @returns {{ whereClause: string, params: Array }}
 */
function buildZoneFilter(query) {
    if (!query || typeof query.zone === 'undefined') {
        return {
            whereClause: '',
            params: []
        };
    }

    const zone = String(query.zone).trim();
    if (zone === '') {
        return {
            whereClause: '',
            params: []
        };
    }

    // Support case-insensitive zone matching for robustness
    return {
        whereClause: 'WHERE UPPER(zone) = UPPER(?)',
        params: [zone]
    };
}

module.exports = {
    buildZoneFilter
};
