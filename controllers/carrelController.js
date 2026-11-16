/**
 * Carrel Controller
 * StudySpot Cafe - Study Carrel Booking Management System
 * Implements GET, POST, PUT and DELETE operations for carrels (Member 3 allocation).
 * Integrates zone filtering and allowlisted sorting from utils (Member 4).
 */

const db = require('../database/database');
const { buildZoneFilter } = require('../utils/carrelSearch');
const { buildSortClause } = require('../utils/carrelSorting');

/**
 * Retrieve all carrels with optional zone filtering and name sorting
 * GET /carrels
 */
async function getAllCarrels(req, res, next) {
    try {
        // Validate and apply sorting from utils
        const sortResult = buildSortClause(req.query);
        if (sortResult.error) {
            return res.status(sortResult.error.status).json({
                success: false,
                message: sortResult.error.message
            });
        }

        // Apply zone search filter from utils
        const { whereClause, params } = buildZoneFilter(req.query);
        const { orderClause } = sortResult;

        const sql = `SELECT id, name, zone FROM carrels ${whereClause} ${orderClause}`.trim();
        const carrels = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            message: 'Carrels retrieved successfully',
            data: carrels
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieve an individual carrel by ID
 * GET /carrels/:id
 */
async function getCarrelById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const carrel = await db.get('SELECT id, name, zone FROM carrels WHERE id = ?', [id]);

        if (!carrel) {
            return res.status(404).json({
                success: false,
                message: 'Carrel not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Carrel retrieved successfully',
            data: carrel
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Create a new carrel
 * POST /carrels
 */
async function createCarrel(req, res, next) {
    try {
        const { name, zone } = req.body;
        const result = await db.run(
            'INSERT INTO carrels (name, zone) VALUES (?, ?)',
            [name, zone]
        );

        return res.status(201).json({
            success: true,
            message: 'Carrel created successfully',
            data: {
                id: result.lastID,
                name,
                zone
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Update an existing carrel by ID
 * PUT /carrels/:id
 */
async function updateCarrel(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        const { name, zone } = req.body;

        const existingCarrel = await db.get('SELECT id FROM carrels WHERE id = ?', [id]);
        if (!existingCarrel) {
            return res.status(404).json({
                success: false,
                message: 'Carrel not found'
            });
        }

        await db.run(
            'UPDATE carrels SET name = ?, zone = ? WHERE id = ?',
            [name, zone, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Carrel updated successfully',
            data: {
                id,
                name,
                zone
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Delete a carrel by ID
 * DELETE /carrels/:id
 */
async function deleteCarrel(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);

        const existingCarrel = await db.get('SELECT id FROM carrels WHERE id = ?', [id]);
        if (!existingCarrel) {
            return res.status(404).json({
                success: false,
                message: 'Carrel not found'
            });
        }

        // Check if carrel is associated with existing bookings to prevent cascade deletion
        const bookingCountRow = await db.get(
            'SELECT COUNT(*) as count FROM bookings WHERE carrel_id = ?',
            [id]
        );

        if (bookingCountRow && bookingCountRow.count > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete carrel: existing bookings are associated with this carrel'
            });
        }

        try {
            await db.run('DELETE FROM carrels WHERE id = ?', [id]);
        } catch (dbErr) {
            if (dbErr.code === 'SQLITE_CONSTRAINT' || String(dbErr.message).includes('FOREIGN KEY')) {
                return res.status(409).json({
                    success: false,
                    message: 'Cannot delete carrel: existing bookings are associated with this carrel'
                });
            }
            throw dbErr;
        }

        return res.status(200).json({
            success: true,
            message: 'Carrel deleted successfully'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllCarrels,
    getCarrelById,
    createCarrel,
    updateCarrel,
    deleteCarrel
};
