const Joi = require('joi');

/**
 * Schema de validação para criação de categoria
 */
const createCategorySchema = Joi.object({
    name: Joi.string()
        .required()
        .min(2)
        .max(50)
        .messages({
            'string.empty': 'Nome da categoria é obrigatório',
            'string.min': 'Nome deve ter no mínimo 2 caracteres',
            'string.max': 'Nome deve ter no máximo 50 caracteres',
            'any.required': 'Nome da categoria é obrigatório'
        }),
    
    slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(50)
        .messages({
            'string.pattern.base': 'Slug deve conter apenas letras minúsculas, números e hífens',
            'string.max': 'Slug deve ter no máximo 50 caracteres'
        }),
    
    has_sizes: Joi.boolean()
        .default(false)
        .messages({
            'boolean.base': 'has_sizes deve ser verdadeiro ou falso'
        })
});

/**
 * Schema de validação para atualização de categoria
 */
const updateCategorySchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Nome deve ter no mínimo 2 caracteres',
            'string.max': 'Nome deve ter no máximo 50 caracteres'
        }),
    
    slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(50)
        .messages({
            'string.pattern.base': 'Slug deve conter apenas letras minúsculas, números e hífens',
            'string.max': 'Slug deve ter no máximo 50 caracteres'
        }),
    
    has_sizes: Joi.boolean()
        .messages({
            'boolean.base': 'has_sizes deve ser verdadeiro ou falso'
        })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};
