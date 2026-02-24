const db = require('../config/database');
const cryptoService = require('./cryptoService');
const auditLogService = require('./auditLogService');

/**
 * Credentials Service - Acesso a Credenciais em Runtime
 * 
 * Este serviço fornece acesso às credenciais descriptografadas
 * para uso pelos outros serviços da aplicação (email, cloudinary, etc.)
 */

class CredentialsService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    /**
     * Obtém credenciais descriptografadas de um serviço
     * 
     * @param {string} service - Nome do serviço
     * @returns {Promise<Object>} Credenciais descriptografadas
     */
    async getCredentials(service) {
        // Verificar cache
        const cached = this.cache.get(service);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.credentials;
        }

        // Buscar do banco
        const [rows] = await db.execute(
            'SELECT * FROM system_credentials WHERE service = ? AND is_configured = TRUE',
            [service]
        );

        if (rows.length === 0) {
            // Fallback para .env se feature estiver desabilitada
            const [settings] = await db.execute(
                "SELECT setting_value FROM developer_settings WHERE setting_key = 'feature_credentials'"
            );

            if (settings.length > 0 && settings[0].setting_value === 'false') {
                return this.getCredentialsFromEnv(service);
            }

            throw new Error(`Serviço ${service} não está configurado`);
        }

        const row = rows[0];

        // Descriptografar
        const credentials = cryptoService.decrypt(
            row.encrypted_value,
            row.iv,
            row.auth_tag,
            process.env.ENCRYPTION_KEY
        );

        // Armazenar em cache
        this.cache.set(service, {
            credentials,
            timestamp: Date.now()
        });

        return credentials;
    }

    /**
     * Fallback para credenciais do .env
     * 
     * @param {string} service - Nome do serviço
     * @returns {Object} Credenciais do .env
     */
    getCredentialsFromEnv(service) {
        switch (service) {
            case 'email':
                return {
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: process.env.EMAIL_SECURE,
                    user: process.env.EMAIL_USER,
                    password: process.env.EMAIL_PASS,
                    from_name: process.env.EMAIL_FROM_NAME
                };
            case 'cloudinary':
                return {
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET
                };
            case 'mercadopago':
                return {
                    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
                    public_key: process.env.MERCADOPAGO_PUBLIC_KEY,
                    webhook_secret: process.env.MERCADOPAGO_WEBHOOK_SECRET
                };
            case 'urls':
                return {
                    frontend_url: process.env.FRONTEND_URL,
                    backend_url: process.env.BACKEND_URL
                };
            case 'jwt':
                return {
                    secret: process.env.JWT_SECRET
                };
            default:
                throw new Error(`Serviço ${service} não suportado`);
        }
    }

    /**
     * Limpa o cache de credenciais
     * 
     * @param {string} service - Nome do serviço (opcional, limpa tudo se não fornecido)
     */
    clearCache(service = null) {
        if (service) {
            this.cache.delete(service);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Verifica se um serviço está configurado
     * 
     * @param {string} service - Nome do serviço
     * @returns {Promise<boolean>} true se configurado
     */
    async isConfigured(service) {
        try {
            await this.getCredentials(service);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Singleton
const credentialsService = new CredentialsService();

module.exports = credentialsService;
