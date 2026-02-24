const { asyncHandler, AppError } = require('./errorHandler');
const auditLogService = require('../services/auditLogService');

/**
 * Middleware de Autorização Developer
 * 
 * Verifica se o usuário autenticado tem role 'developer'
 * Apenas developers podem acessar endpoints de gerenciamento de credenciais
 */
const developerAuth = asyncHandler(async (req, res, next) => {
    // Verificar se usuário está autenticado
    if (!req.user) {
        throw new AppError('Autenticação necessária', 401);
    }

    // Verificar se é developer
    if (req.user.role !== 'developer') {
        // Registrar tentativa não autorizada
        await auditLogService.logCredentialChange(
            'system',
            'accessed',
            req.user.id,
            {
                name: req.user.full_name,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get('user-agent')
            },
            false,
            'Acesso negado: usuário não é developer'
        );

        throw new AppError('Acesso negado. Apenas desenvolvedores podem gerenciar credenciais.', 403);
    }

    next();
});

module.exports = developerAuth;
