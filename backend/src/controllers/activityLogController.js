const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const activityLogController = {
    getAll: asyncHandler(async (req, res) => {
        console.log('📋 Requisição de logs recebida:', req.query);
        
        const { 
            page = 1, 
            limit = 12,
            sortBy = 'recent', // recent, oldest
            entityType = 'all' // all, products, categories, orders, users
        } = req.query;
        
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Verificar se a tabela existe
        const [tables] = await db.execute("SHOW TABLES LIKE 'activity_logs'");
        
        console.log('✅ Tabela activity_logs existe:', tables.length > 0);
        
        if (tables.length === 0) {
            return res.json({
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    totalPages: 0
                }
            });
        }

        // Construir query com filtros
        let whereClause = '';
        const params = [];

        if (entityType !== 'all') {
            whereClause = 'WHERE al.target_table = ?';
            params.push(entityType);
        }

        const orderBy = sortBy === 'oldest' ? 'ASC' : 'DESC';
        
        // Usar valores diretos para LIMIT e OFFSET (não como placeholders)
        const limitValue = parseInt(limit);
        const offsetValue = parseInt(offset);

        const query = `
            SELECT 
                al.id,
                al.user_id,
                al.action,
                al.target_table as entity_type,
                al.target_id as entity_id,
                al.details,
                al.created_at,
                u.full_name as user_name,
                u.email as user_email,
                u.role as user_role
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ${whereClause}
            ORDER BY al.created_at ${orderBy}
            LIMIT ${limitValue} OFFSET ${offsetValue}
        `;

        console.log('🔍 Query:', query);
        console.log('🔍 Params:', params);

        const [logs] = await db.execute(query, params);
        
        console.log('✅ Logs encontrados:', logs.length);

        // Contar total
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM activity_logs al
            ${whereClause}
        `;
        
        const countParams = entityType !== 'all' ? [entityType] : [];
        const [countResult] = await db.execute(countQuery, countParams);
        
        console.log('✅ Total de logs:', countResult[0].total);

        res.json({
            data: logs.map(log => {
                let parsedDetails = null;
                if (log.details) {
                    try {
                        parsedDetails = typeof log.details === 'string' 
                            ? JSON.parse(log.details) 
                            : log.details;
                    } catch (e) {
                        console.error('❌ Erro ao parsear details:', e);
                        parsedDetails = null;
                    }
                }
                return {
                    ...log,
                    details: parsedDetails
                };
            }),
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult[0].total / parseInt(limit))
            }
        });
        
        console.log('✅ Resposta enviada com sucesso');
    })
};

module.exports = activityLogController;
