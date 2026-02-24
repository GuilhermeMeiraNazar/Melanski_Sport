const db = require('../config/database');
const { AppError } = require('./errorHandler');

/**
 * Middleware para verificar se uma feature está ativa
 * Usado para bloquear acesso a funcionalidades desabilitadas pelo developer
 */
const checkFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            const query = `
                SELECT setting_value
                FROM developer_settings
                WHERE setting_key = ?
            `;
            
            const [results] = await db.execute(query, [featureName]);

            // Se não encontrar a configuração, assume que está ativa (fallback seguro)
            if (results.length === 0) {
                console.warn(`⚠️ Feature ${featureName} não encontrada nas configurações, permitindo acesso`);
                return next();
            }

            const isActive = results[0].setting_value === 'true' || results[0].setting_value === '1';

            if (!isActive) {
                throw new AppError(`Funcionalidade ${featureName} está desabilitada`, 403);
            }

            next();
        } catch (error) {
            // Se for erro de AppError, propagar
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }

            // Se for erro de banco, logar e permitir acesso (fallback seguro)
            console.error(`Erro ao verificar feature ${featureName}:`, error);
            next();
        }
    };
};

/**
 * Middleware para verificar limite de recursos
 * Exemplo: limite de produtos, categorias, usuários
 */
const checkResourceLimit = (resourceType) => {
    return async (req, res, next) => {
        try {
            // Mapear tipo de recurso para tabela e configuração
            const resourceMap = {
                'products': { table: 'products', setting: 'max_products' },
                'categories': { table: 'product_categories', setting: 'max_categories' },
                'users': { table: 'users', setting: 'max_users' }
            };

            const resource = resourceMap[resourceType];
            if (!resource) {
                console.warn(`⚠️ Tipo de recurso ${resourceType} não mapeado`);
                return next();
            }

            // Buscar limite configurado
            const [limitResult] = await db.execute(
                'SELECT setting_value FROM developer_settings WHERE setting_key = ?',
                [resource.setting]
            );

            if (limitResult.length === 0) {
                return next(); // Sem limite configurado
            }

            const maxLimit = parseInt(limitResult[0].setting_value, 10);

            // Contar recursos existentes
            const [countResult] = await db.execute(
                `SELECT COUNT(*) as count FROM ${resource.table}`
            );

            const currentCount = countResult[0].count;

            if (currentCount >= maxLimit) {
                throw new AppError(
                    `Limite de ${resourceType} atingido (${maxLimit}). Entre em contato com o administrador.`,
                    403
                );
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }

            console.error(`Erro ao verificar limite de ${resourceType}:`, error);
            next();
        }
    };
};

module.exports = {
    checkFeature,
    checkResourceLimit
};
