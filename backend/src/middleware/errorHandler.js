/**
 * Middleware centralizado para tratamento de erros
 * Padroniza respostas de erro em toda a aplicação
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Erro de validação
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.message
        });
    }

    // Erro de autenticação
    if (err.name === 'UnauthorizedError' || err.status === 401) {
        return res.status(401).json({
            error: 'Não autorizado',
            message: 'Token inválido ou expirado'
        });
    }

    // Erro de permissão
    if (err.status === 403) {
        return res.status(403).json({
            error: 'Acesso negado',
            message: 'Você não tem permissão para realizar esta ação'
        });
    }

    // Erro de recurso não encontrado
    if (err.status === 404) {
        return res.status(404).json({
            error: 'Não encontrado',
            message: err.message || 'Recurso não encontrado'
        });
    }

    // Erro de conflito (ex: email duplicado)
    if (err.code === 'ER_DUP_ENTRY' || err.status === 409) {
        return res.status(409).json({
            error: 'Conflito',
            message: 'Registro já existe'
        });
    }

    // Erro genérico do servidor
    res.status(err.status || 500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro inesperado'
    });
};

/**
 * Wrapper para funções assíncronas
 * Captura erros automaticamente e passa para o errorHandler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Cria um erro customizado com status
 */
class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        this.name = 'AppError';
    }
}

module.exports = {
    errorHandler,
    asyncHandler,
    AppError
};
