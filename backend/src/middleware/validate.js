const { AppError } = require('./errorHandler');

/**
 * Middleware de validação usando Joi
 * @param {Object} schema - Schema Joi para validação
 * @param {string} property - Propriedade do request a validar (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Retorna todos os erros, não apenas o primeiro
            stripUnknown: true // Remove campos não definidos no schema
        });

        if (error) {
            // Formatar erros de validação
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            // Criar mensagem de erro amigável
            const errorMessage = errors.map(e => e.message).join(', ');

            throw new AppError(errorMessage, 400);
        }

        // Substituir req[property] com valores validados e sanitizados
        req[property] = value;
        next();
    };
};

module.exports = validate;
