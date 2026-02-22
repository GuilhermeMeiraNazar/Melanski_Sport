const Joi = require('joi');

/**
 * Schema de validação para criação de produto
 */
const createProductSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Nome do produto é obrigatório',
            'string.min': 'Nome deve ter no mínimo 3 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres',
            'any.required': 'Nome do produto é obrigatório'
        }),
    
    description: Joi.string()
        .allow('', null)
        .max(1000)
        .messages({
            'string.max': 'Descrição deve ter no máximo 1000 caracteres'
        }),
    
    sale_price: Joi.number()
        .required()
        .positive()
        .precision(2)
        .messages({
            'number.base': 'Preço deve ser um número',
            'number.positive': 'Preço deve ser positivo',
            'any.required': 'Preço é obrigatório'
        }),
    
    category_id: Joi.number()
        .required()
        .integer()
        .positive()
        .messages({
            'number.base': 'ID da categoria deve ser um número',
            'number.integer': 'ID da categoria deve ser um número inteiro',
            'number.positive': 'ID da categoria inválido',
            'any.required': 'Categoria é obrigatória'
        }),
    
    team: Joi.string()
        .allow('', null)
        .max(50)
        .messages({
            'string.max': 'Nome do time deve ter no máximo 50 caracteres'
        }),
    
    gender: Joi.string()
        .valid('Masculino', 'Feminino', 'Unissex', '')
        .allow(null)
        .messages({
            'any.only': 'Gênero deve ser Masculino, Feminino ou Unissex'
        }),
    
    type: Joi.string()
        .valid('Nacional', 'Internacional', '')
        .allow(null)
        .messages({
            'any.only': 'Tipo deve ser Nacional ou Internacional'
        }),
    
    has_discount: Joi.number()
        .valid(0, 1)
        .default(0)
        .messages({
            'any.only': 'has_discount deve ser 0 ou 1'
        }),
    
    discount_percentage: Joi.number()
        .min(0)
        .max(100)
        .precision(2)
        .default(0)
        .messages({
            'number.min': 'Desconto não pode ser negativo',
            'number.max': 'Desconto não pode ser maior que 100%'
        }),
    
    images: Joi.array()
        .items(Joi.string().uri())
        .min(1)
        .messages({
            'array.min': 'Pelo menos uma imagem é obrigatória',
            'string.uri': 'URL de imagem inválida'
        }),
    
    sizes: Joi.object()
        .pattern(
            Joi.string(),
            Joi.number().integer().min(0)
        )
        .messages({
            'object.base': 'Tamanhos devem ser um objeto',
            'number.min': 'Quantidade não pode ser negativa'
        })
});

/**
 * Schema de validação para atualização de produto
 */
const updateProductSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Nome deve ter no mínimo 3 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres'
        }),
    
    description: Joi.string()
        .allow('', null)
        .max(1000)
        .messages({
            'string.max': 'Descrição deve ter no máximo 1000 caracteres'
        }),
    
    sale_price: Joi.number()
        .positive()
        .precision(2)
        .messages({
            'number.positive': 'Preço deve ser positivo'
        }),
    
    category_id: Joi.number()
        .integer()
        .positive()
        .messages({
            'number.integer': 'ID da categoria deve ser um número inteiro',
            'number.positive': 'ID da categoria inválido'
        }),
    
    team: Joi.string()
        .allow('', null)
        .max(50)
        .messages({
            'string.max': 'Nome do time deve ter no máximo 50 caracteres'
        }),
    
    gender: Joi.string()
        .valid('Masculino', 'Feminino', 'Unissex', '')
        .allow(null)
        .messages({
            'any.only': 'Gênero deve ser Masculino, Feminino ou Unissex'
        }),
    
    type: Joi.string()
        .valid('Nacional', 'Internacional', '')
        .allow(null)
        .messages({
            'any.only': 'Tipo deve ser Nacional ou Internacional'
        }),
    
    has_discount: Joi.number()
        .valid(0, 1)
        .messages({
            'any.only': 'has_discount deve ser 0 ou 1'
        }),
    
    discount_percentage: Joi.number()
        .min(0)
        .max(100)
        .precision(2)
        .messages({
            'number.min': 'Desconto não pode ser negativo',
            'number.max': 'Desconto não pode ser maior que 100%'
        }),
    
    images: Joi.array()
        .items(Joi.string().uri())
        .messages({
            'string.uri': 'URL de imagem inválida'
        }),
    
    sizes: Joi.object()
        .pattern(
            Joi.string(),
            Joi.number().integer().min(0)
        )
        .messages({
            'number.min': 'Quantidade não pode ser negativa'
        })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

module.exports = {
    createProductSchema,
    updateProductSchema
};
