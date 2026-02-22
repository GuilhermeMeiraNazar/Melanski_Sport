const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

const activityLogController = {
    getAll: asyncHandler(async (req, res) => {
        const { page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const query = `
            SELECT 
                al.*,
                u.full_name as user_name,
                u.email as user_email
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const [logs] = await db.execute(query, [parseInt(limit), offset]);

        const [countResult] = await db.execute(
            'SELECT COUNT(*) as total FROM activity_logs'
        );

        res.json({
            data: logs.map(log => ({
                ...log,
                details: log.details ? JSON.parse(log.details) : null
            })),
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
    })
};

module.exports = activityLogController;
