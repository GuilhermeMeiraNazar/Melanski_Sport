/**
 * Middleware de Rate Limiting
 * Protege a API contra ataques de força bruta e DDoS
 * 
 * Nota: express-rate-limit precisa ser instalado
 * npm install express-rate-limit
 */

// Simulação de rate limiter sem dependência externa
// Para produção, instale: npm install express-rate-limit

/**
 * Rate limiter simples baseado em memória
 * Para produção, use express-rate-limit com Redis
 */
const requestCounts = new Map();

const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutos
        max = 100, // máximo de requisições
        message = 'Muitas requisições, tente novamente mais tarde',
        statusCode = 429
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Limpar entradas antigas
        for (const [ip, data] of requestCounts.entries()) {
            if (now - data.resetTime > windowMs) {
                requestCounts.delete(ip);
            }
        }

        // Obter ou criar contador para este IP
        let record = requestCounts.get(key);
        
        if (!record) {
            record = {
                count: 0,
                resetTime: now
            };
            requestCounts.set(key, record);
        }

        // Resetar contador se a janela expirou
        if (now - record.resetTime > windowMs) {
            record.count = 0;
            record.resetTime = now;
        }

        // Incrementar contador
        record.count++;

        // Adicionar headers de rate limit
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime + windowMs).toISOString());

        // Verificar se excedeu o limite
        if (record.count > max) {
            return res.status(statusCode).json({
                error: message,
                retryAfter: Math.ceil((record.resetTime + windowMs - now) / 1000)
            });
        }

        next();
    };
};

/**
 * Limiter para rotas de autenticação (mais restritivo)
 */
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

/**
 * Limiter para rotas de API gerais
 */
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
});

/**
 * Limiter para criação de recursos (mais restritivo)
 */
const createLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 criações
    message: 'Limite de criações atingido. Tente novamente em 1 hora.'
});

/**
 * Limiter para upload de arquivos (muito restritivo)
 */
const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 uploads
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
});

module.exports = {
    createRateLimiter,
    authLimiter,
    apiLimiter,
    createLimiter,
    uploadLimiter
};
