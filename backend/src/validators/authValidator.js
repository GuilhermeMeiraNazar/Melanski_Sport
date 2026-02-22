const Joi = require('joi');

/**
 * Schema de validação para registro de usuário
 */
const registerSchema = Joi.object({
    full_name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Nome completo é obrigatório',
            'string.min': 'Nome deve ter no mínimo 3 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres',
            'any.required': 'Nome completo é obrigatório'
        }),
    
    email: Joi.string()
        .required()
        .email()
        .max(100)
        .messages({
            'string.empty': 'Email é obrigatório',
            'string.email': 'Email inválido',
            'string.max': 'Email deve ter no máximo 100 caracteres',
            'any.required': 'Email é obrigatório'
        }),
    
    password: Joi.string()
        .required()
        .min(6)
        .max(100)
        .messages({
            'string.empty': 'Senha é obrigatória',
            'string.min': 'Senha deve ter no mínimo 6 caracteres',
            'string.max': 'Senha deve ter no máximo 100 caracteres',
            'any.required': 'Senha é obrigatória'
        }),
    
    role: Joi.string()
        .valid('client', 'admin', 'developer')
        .default('client')
        .messages({
            'any.only': 'Role deve ser client, admin ou developer'
        })
});

/**
 * Schema de validação para login
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.empty': 'Email é obrigatório',
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Senha é obrigatória',
            'any.required': 'Senha é obrigatória'
        })
});

/**
 * Schema de validação para verificação de email
 */
const verifyEmailSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.empty': 'Email é obrigatório',
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        }),
    
    code: Joi.string()
        .required()
        .length(6)
        .pattern(/^[0-9]+$/)
        .messages({
            'string.empty': 'Código é obrigatório',
            'string.length': 'Código deve ter 6 dígitos',
            'string.pattern.base': 'Código deve conter apenas números',
            'any.required': 'Código é obrigatório'
        })
});

/**
 * Schema de validação para atualização de perfil
 */
const updateProfileSchema = Joi.object({
    full_name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Nome deve ter no mínimo 3 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres'
        }),
    
    email: Joi.string()
        .email()
        .max(100)
        .messages({
            'string.email': 'Email inválido',
            'string.max': 'Email deve ter no máximo 100 caracteres'
        })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

/**
 * Schema de validação para mudança de senha
 */
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Senha atual é obrigatória',
            'any.required': 'Senha atual é obrigatória'
        }),
    
    newPassword: Joi.string()
        .required()
        .min(6)
        .max(100)
        .messages({
            'string.empty': 'Nova senha é obrigatória',
            'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
            'string.max': 'Nova senha deve ter no máximo 100 caracteres',
            'any.required': 'Nova senha é obrigatória'
        })
});

/**
 * Schema de validação para solicitação de reset de senha
 */
const requestPasswordResetSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.empty': 'Email é obrigatório',
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        })
});

/**
 * Schema de validação para reset de senha
 */
const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.empty': 'Email é obrigatório',
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        }),
    
    code: Joi.string()
        .required()
        .length(6)
        .pattern(/^[0-9]+$/)
        .messages({
            'string.empty': 'Código é obrigatório',
            'string.length': 'Código deve ter 6 dígitos',
            'string.pattern.base': 'Código deve conter apenas números',
            'any.required': 'Código é obrigatório'
        }),
    
    newPassword: Joi.string()
        .required()
        .min(6)
        .max(100)
        .messages({
            'string.empty': 'Nova senha é obrigatória',
            'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
            'string.max': 'Nova senha deve ter no máximo 100 caracteres',
            'any.required': 'Nova senha é obrigatória'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    updateProfileSchema,
    changePasswordSchema,
    requestPasswordResetSchema,
    resetPasswordSchema
};
