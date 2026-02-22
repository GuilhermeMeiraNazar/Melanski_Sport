const db = require('../config/database');

const logActivity = async (userId, action, targetTable, targetId, details = null) => {
    try {
        await db.execute(
            `INSERT INTO activity_logs (user_id, action, target_table, target_id, details) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                userId,
                action,
                targetTable,
                targetId,
                details ? JSON.stringify(details) : null
            ]
        );
    } catch (error) {
        console.error('Erro ao registrar log de atividade:', error);
    }
};

module.exports = { logActivity };
