const db = require('../config/database');
const cryptoService = require('../services/cryptoService');
const validationService = require('../services/validationService');
const auditLogService = require('../services/auditLogService');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Função auxiliar para mascarar credenciais
function maskCredential(value) {
    if (!value || typeof value !== 'string') return '****';
    if (value.length <= 4) return '****';
    return value.substring(0, 2) + '****' + value.substring(value.length - 2);
}

// Função auxiliar para mascarar objeto de credenciais
function maskCredentials(credentials) {
    const masked = {};
    for (const [key, value] of Object.entries(credentials)) {
        if (key.includes('password') || key.includes('secret') || key.includes('token') || key.includes('key')) {
            masked[key] = maskCredential(value);
        } else {
            masked[key] = value;
        }
    }
    return masked;
}

const credentialsController = {
    // Listar todos os serviços
    listServices: asyncHandler(async (req, res) => {
        const [services] = await db.execute(`
            SELECT service, is_configured, updated_at
            FROM system_credentials
            ORDER BY service
        `);

        // Adicionar serviços não configurados
        const allServices = ['email', 'cloudinary', 'mercadopago', 'whatsapp', 'urls', 'jwt'];
        const configuredServices = services.map(s => s.service);
        
        const result = allServices.map(service => {
            const found = services.find(s => s.service === service);
            return found || { service, is_configured: false, updated_at: null };
        });

        res.json({ services: result });
    }),

    // Obter credenciais de um serviço (mascaradas)
    getCredentials: asyncHandler(async (req, res) => {
        const { service } = req.params;

        const [rows] = await db.execute(
            'SELECT * FROM system_credentials WHERE service = ?',
            [service]
        );

        if (rows.length === 0) {
            return res.json({ configured: false, credentials: null });
        }

        const row = rows[0];

        // Descriptografar
        const credentials = cryptoService.decrypt(
            row.encrypted_value,
            row.iv,
            row.auth_tag,
            process.env.ENCRYPTION_KEY
        );

        // Mascarar valores sensíveis
        const maskedCredentials = maskCredentials(credentials);

        res.json({
            configured: true,
            credentials: maskedCredentials,
            updated_at: row.updated_at
        });
    }),

    // Atualizar credenciais
    updateCredentials: asyncHandler(async (req, res) => {
        const { service } = req.params;
        const credentials = req.body;

        // Criptografar
        const encrypted = cryptoService.encrypt(credentials, process.env.ENCRYPTION_KEY);

        // Verificar se já existe
        const [existing] = await db.execute(
            'SELECT id FROM system_credentials WHERE service = ?',
            [service]
        );

        if (existing.length > 0) {
            // Atualizar
            await db.execute(
                `UPDATE system_credentials 
                SET encrypted_value = ?, iv = ?, auth_tag = ?, is_configured = TRUE, updated_by = ?
                WHERE service = ?`,
                [encrypted.encrypted, encrypted.iv, encrypted.authTag, req.user.id, service]
            );
        } else {
            // Inserir
            await db.execute(
                `INSERT INTO system_credentials (service, encrypted_value, iv, auth_tag, is_configured, updated_by)
                VALUES (?, ?, ?, ?, TRUE, ?)`,
                [service, encrypted.encrypted, encrypted.iv, encrypted.authTag, req.user.id]
            );
        }

        // Registrar no audit log
        await auditLogService.logCredentialChange(
            service,
            existing.length > 0 ? 'updated' : 'created',
            req.user.id,
            {
                name: req.user.full_name,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get('user-agent')
            },
            true
        );

        res.json({ success: true, message: 'Credenciais salvas com sucesso' });
    }),

    // Testar conexão
    testConnection: asyncHandler(async (req, res) => {
        const { service } = req.params;
        const credentials = req.body;

        // Validar credenciais
        const result = await validationService.validateCredentials(service, credentials);

        // Registrar no audit log
        await auditLogService.logCredentialChange(
            service,
            'tested',
            req.user.id,
            {
                name: req.user.full_name,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get('user-agent')
            },
            result.valid,
            result.error
        );

        res.json(result);
    }),

    // Deletar credenciais
    deleteCredentials: asyncHandler(async (req, res) => {
        const { service } = req.params;

        const [result] = await db.execute(
            'DELETE FROM system_credentials WHERE service = ?',
            [service]
        );

        if (result.affectedRows === 0) {
            throw new AppError('Credenciais não encontradas', 404);
        }

        // Registrar no audit log
        await auditLogService.logCredentialChange(
            service,
            'deleted',
            req.user.id,
            {
                name: req.user.full_name,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get('user-agent')
            },
            true
        );

        res.json({ success: true, message: 'Credenciais removidas com sucesso' });
    }),

    // Obter histórico de auditoria
    getAuditHistory: asyncHandler(async (req, res) => {
        const { service } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const logs = await auditLogService.getAuditLogs({
            service,
            limit,
            offset
        });

        res.json(logs);
    })
};

module.exports = credentialsController;
