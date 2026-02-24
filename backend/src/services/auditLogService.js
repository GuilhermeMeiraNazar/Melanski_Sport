const db = require('../config/database');

/**
 * Audit Log Service - Registro de Auditoria de Operações em Credenciais
 * 
 * Este serviço registra todas as operações realizadas em credenciais
 * para rastreabilidade e conformidade de segurança.
 */

class AuditLogService {
    /**
     * Registra uma operação em credenciais
     * 
     * @param {string} service - Serviço afetado (email, cloudinary, etc.)
     * @param {string} action - Ação realizada (created, updated, deleted, tested, accessed)
     * @param {number} userId - ID do usuário
     * @param {Object} userInfo - { name, email, ip, userAgent }
     * @param {boolean} success - Se a operação foi bem-sucedida
     * @param {string} errorMessage - Mensagem de erro (se success=false)
     * @returns {Promise<number>} ID do log criado
     */
    async logCredentialChange(service, action, userId, userInfo = {}, success = true, errorMessage = null) {
        try {
            const { name, email, ip, userAgent } = userInfo;

            const [result] = await db.execute(
                `INSERT INTO credentials_audit_log 
                (service, action, user_id, user_name, user_email, ip_address, user_agent, success, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [service, action, userId, name || null, email || null, ip || null, userAgent || null, success, errorMessage]
            );

            console.log(`📝 Audit log criado: ${service} - ${action} - ${success ? 'sucesso' : 'falha'}`);
            
            return result.insertId;
        } catch (error) {
            console.error('❌ Erro ao criar audit log:', error.message);
            // Não lançar erro para não interromper operação principal
            return null;
        }
    }

    /**
     * Busca logs de auditoria com filtros
     * 
     * @param {Object} filters - { service, action, userId, limit, offset }
     * @returns {Promise<Array>} Lista de logs
     */
    async getAuditLogs(filters = {}) {
        try {
            const { service, action, userId, limit = 50, offset = 0 } = filters;

            let query = 'SELECT * FROM credentials_audit_log WHERE 1=1';
            const params = [];

            if (service) {
                query += ' AND service = ?';
                params.push(service);
            }

            if (action) {
                query += ' AND action = ?';
                params.push(action);
            }

            if (userId) {
                query += ' AND user_id = ?';
                params.push(userId);
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const [logs] = await db.execute(query, params);
            
            return logs;
        } catch (error) {
            console.error('❌ Erro ao buscar audit logs:', error.message);
            throw error;
        }
    }

    /**
     * Remove logs antigos (rotação)
     * 
     * @param {number} days - Número de dias para manter (padrão: 90)
     * @returns {Promise<number>} Número de registros removidos
     */
    async rotateLogs(days = 90) {
        try {
            const [result] = await db.execute(
                `DELETE FROM credentials_audit_log 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
                [days]
            );

            console.log(`🗑️  Audit logs rotacionados: ${result.affectedRows} registros removidos`);
            
            return result.affectedRows;
        } catch (error) {
            console.error('❌ Erro ao rotacionar audit logs:', error.message);
            throw error;
        }
    }

    /**
     * Obtém estatísticas de auditoria
     * 
     * @returns {Promise<Object>} Estatísticas agregadas
     */
    async getStatistics() {
        try {
            const [stats] = await db.execute(`
                SELECT 
                    service,
                    action,
                    COUNT(*) as count,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
                    SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failure_count
                FROM credentials_audit_log
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY service, action
                ORDER BY service, action
            `);

            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error.message);
            throw error;
        }
    }
}

// Singleton
const auditLogService = new AuditLogService();

module.exports = auditLogService;
