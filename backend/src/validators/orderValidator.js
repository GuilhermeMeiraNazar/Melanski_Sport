const Joi = require('joi');

/**
 * Schema para criação de pedido
 */
const createOrderSchema = Joi.object({
  user_id: Joi.number().integer().positive().allow(null).optional()
    .messages({
      'number.base': 'ID do usuário deve ser um número',
      'number.positive': 'ID do usuário deve ser positivo'
    }),
  
  // Dados do cliente
  customer_name: Joi.string().required().min(3).max(255)
    .messages({
      'string.empty': 'Nome do cliente é obrigatório',
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 255 caracteres'
    }),
  
  customer_email: Joi.string().email().allow(null, '').optional()
    .messages({
      'string.email': 'Email inválido'
    }),
  
  customer_phone: Joi.string().required().min(10).max(20)
    .messages({
      'string.empty': 'Telefone é obrigatório',
      'string.min': 'Telefone deve ter no mínimo 10 caracteres',
      'string.max': 'Telefone deve ter no máximo 20 caracteres'
    }),
  
  // Endereço de entrega
  delivery_address: Joi.string().required().min(10).max(500)
    .messages({
      'string.empty': 'Endereço de entrega é obrigatório',
      'string.min': 'Endereço deve ter no mínimo 10 caracteres',
      'string.max': 'Endereço deve ter no máximo 500 caracteres'
    }),
  
  delivery_city: Joi.string().required().min(2).max(100)
    .messages({
      'string.empty': 'Cidade é obrigatória',
      'string.min': 'Cidade deve ter no mínimo 2 caracteres',
      'string.max': 'Cidade deve ter no máximo 100 caracteres'
    }),
  
  delivery_state: Joi.string().required().length(2).uppercase()
    .messages({
      'string.empty': 'Estado é obrigatório',
      'string.length': 'Estado deve ter 2 caracteres (ex: SP)',
      'string.uppercase': 'Estado deve estar em maiúsculas'
    }),
  
  delivery_zip: Joi.string().required().min(8).max(10)
    .messages({
      'string.empty': 'CEP é obrigatório',
      'string.min': 'CEP deve ter no mínimo 8 caracteres',
      'string.max': 'CEP deve ter no máximo 10 caracteres'
    }),
  
  // Observações
  notes: Joi.string().allow(null, '').max(1000).optional()
    .messages({
      'string.max': 'Observações devem ter no máximo 1000 caracteres'
    }),
  
  // Itens do pedido
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'ID do produto deve ser um número',
          'number.positive': 'ID do produto deve ser positivo',
          'any.required': 'ID do produto é obrigatório'
        }),
      
      product_name: Joi.string().required().max(255)
        .messages({
          'string.empty': 'Nome do produto é obrigatório',
          'string.max': 'Nome do produto deve ter no máximo 255 caracteres'
        }),
      
      product_size: Joi.string().allow(null, '').max(10).optional()
        .messages({
          'string.max': 'Tamanho deve ter no máximo 10 caracteres'
        }),
      
      product_image: Joi.string().allow(null, '').max(500).optional()
        .messages({
          'string.max': 'URL da imagem deve ter no máximo 500 caracteres'
        }),
      
      quantity: Joi.number().integer().positive().required()
        .messages({
          'number.base': 'Quantidade deve ser um número',
          'number.positive': 'Quantidade deve ser positiva',
          'any.required': 'Quantidade é obrigatória'
        }),
      
      unit_price: Joi.number().positive().required()
        .messages({
          'number.base': 'Preço unitário deve ser um número',
          'number.positive': 'Preço unitário deve ser positivo',
          'any.required': 'Preço unitário é obrigatório'
        })
    })
  ).min(1).required()
    .messages({
      'array.min': 'Pedido deve ter pelo menos 1 item',
      'any.required': 'Itens do pedido são obrigatórios'
    })
});

/**
 * Schema para atualização de status
 */
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('cancelled', 'completed').required()
    .messages({
      'string.empty': 'Status é obrigatório',
      'any.only': 'Status deve ser "cancelled" ou "completed"',
      'any.required': 'Status é obrigatório'
    })
});

module.exports = {
  createOrderSchema,
  updateStatusSchema
};
