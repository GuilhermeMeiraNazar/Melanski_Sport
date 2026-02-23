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
    
    // Aceita tanto salePrice (frontend) quanto sale_price (backend)
    salePrice: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': 'Preço deve ser um número',
            'number.positive': 'Preço deve ser positivo',
            'any.required': 'Preço é obrigatório'
        }),
    
    // Aceita tanto costPrice (frontend) quanto cost_price (backend)
    costPrice: Joi.number()
        .positive()
        .allow(0)
        .messages({
            'number.base': 'Custo deve ser um número',
            'number.positive': 'Custo deve ser positivo'
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
    
    // Campo adicional que o frontend envia
    category: Joi.string()
        .allow('', null)
        .messages({
            'string.base': 'Nome da categoria deve ser texto'
        }),
    
    team: Joi.string()
        .allow('', null)
        .max(50)
        .messages({
            'string.max': 'Nome do time deve ter no máximo 50 caracteres'
        }),
    
    gender: Joi.string()
        .valid('Masculino', 'Feminino', 'Unissex', 'Infantil', '')
        .allow(null)
        .messages({
            'any.only': 'Gênero deve ser Masculino, Feminino, Infantil ou Unissex'
        }),
    
    // Aceita tanto origin (frontend) quanto type (backend)
    origin: Joi.string()
        .valid('Nacional', 'Internacional', '')
        .allow(null)
        .messages({
            'any.only': 'Origem deve ser Nacional ou Internacional'
        }),
    
    type: Joi.string()
        .valid('Nacional', 'Internacional', '')
        .allow(null)
        .messages({
            'any.only': 'Tipo deve ser Nacional ou Internacional'
        }),
    
    // Aceita tanto hasDiscount (frontend) quanto has_discount (backend)
    hasDiscount: Joi.boolean()
        .default(false)
        .messages({
            'boolean.base': 'hasDiscount deve ser verdadeiro ou falso'
        }),
    
    has_discount: Joi.number()
        .valid(0, 1)
        .default(0)
        .messages({
            'any.only': 'has_discount deve ser 0 ou 1'
        }),
    
    // Aceita tanto discountPercentage (frontend) quanto discount_percentage (backend)
    discountPercentage: Joi.number()
        .min(0)
        .max(100)
        .default(0)
        .messages({
            'number.min': 'Desconto não pode ser negativo',
            'number.max': 'Desconto não pode ser maior que 100%'
        }),
    
    discount_percentage: Joi.number()
        .min(0)
        .max(100)
        .default(0)
        .messages({
            'number.min': 'Desconto não pode ser negativo',
            'number.max': 'Desconto não pode ser maior que 100%'
        }),
    
    // Aceita imagens como array de strings (base64 ou URLs)
    images: Joi.array()
        .items(Joi.string())
        .min(1)
        .messages({
            'array.min': 'Pelo menos uma imagem é obrigatória'
        }),
    
    // Aceita tanto stock (frontend) quanto sizes (backend)
    stock: Joi.alternatives()
        .try(
            Joi.number().integer().min(0),
            Joi.object().pattern(
                Joi.string(),
                Joi.number().integer().min(0)
            )
        )
        .messages({
            'number.min': 'Quantidade não pode ser negativa'
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
    
    salePrice: Joi.number()
        .positive()
        .messages({
            'number.positive': 'Preço deve ser positivo'
        }),
    
    costPrice: Joi.number()
        .positive()
        .allow(0)
        .messages({
            'number.positive': 'Custo deve ser positivo'
        }),
    
    category_id: Joi.number()
        .integer()
        .positive()
        .messages({
            'number.integer': 'ID da categoria deve ser um número inteiro',
            'number.positive': 'ID da categoria inválido'
        }),
    
    category: Joi.string()
        .allow('', null),
    
    team: Joi.string()
        .allow('', null)
        .max(50)
        .messages({
            'string.max': 'Nome do time deve ter no máximo 50 caracteres'
        }),
    
    gender: Joi.string()
        .valid('Masculino', 'Feminino', 'Unissex', 'Infantil', '')
        .allow(null)
        .messages({
            'any.only': 'Gênero deve ser Masculino, Feminino, Infantil ou Unissex'
        }),
    
    origin: Joi.string()
        .valid('Nacional', 'Internacional', '')
        .allow(null)
        .messages({
            'any.only': 'Origem deve ser Nacional ou Internacional'
        }),
    
    type: Joi.string()
        .valid('Nacional', 'Internacional', '')
        .allow(null)
        .messages({
            'any.only': 'Tipo deve ser Nacional ou Internacional'
        }),
    
    hasDiscount: Joi.boolean()
        .messages({
            'boolean.base': 'hasDiscount deve ser verdadeiro ou falso'
        }),
    
    has_discount: Joi.number()
        .valid(0, 1)
        .messages({
            'any.only': 'has_discount deve ser 0 ou 1'
        }),
    
    discountPercentage: Joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.min': 'Desconto não pode ser negativo',
            'number.max': 'Desconto não pode ser maior que 100%'
        }),
    
    discount_percentage: Joi.number()
        .min(0)
        .max(100)
        .messages({
            'number.min': 'Desconto não pode ser negativo',
            'number.max': 'Desconto não pode ser maior que 100%'
        }),
    
    images: Joi.array()
        .items(Joi.string())
        .messages({
            'string.base': 'Imagem deve ser uma string'
        }),
    
    stock: Joi.alternatives()
        .try(
            Joi.number().integer().min(0),
            Joi.object().pattern(
                Joi.string(),
                Joi.number().integer().min(0)
            )
        )
        .messages({
            'number.min': 'Quantidade não pode ser negativa'
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
