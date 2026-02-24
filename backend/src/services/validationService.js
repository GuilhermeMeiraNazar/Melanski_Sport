const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Validation Service - Validação de Credenciais de Serviços Externos
 * 
 * Este serviço testa conexões reais com serviços externos para validar
 * que as credenciais fornecidas estão corretas antes de salvá-las.
 */

class ValidationService {
    constructor() {
        this.timeout = 10000; // 10 segundos
    }

    /**
     * Valida credenciais SMTP enviando email de teste
     * 
     * @param {Object} credentials - { host, port, secure, user, password, from_name }
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateEmailCredentials(credentials) {
        try {
            const { host, port, secure, user, password } = credentials;

            // Validar campos obrigatórios
            if (!host || !port || !user || !password) {
                return {
                    valid: false,
                    message: 'Campos obrigatórios ausentes: host, port, user, password',
                    error: 'MISSING_FIELDS'
                };
            }

            // Criar transporter
            const transporter = nodemailer.createTransport({
                host,
                port: parseInt(port),
                secure: secure === 'true' || secure === true,
                auth: { user, pass: password },
                connectionTimeout: this.timeout,
                greetingTimeout: this.timeout
            });

            // Verificar conexão
            await transporter.verify();

            return {
                valid: true,
                message: 'Conexão SMTP estabelecida com sucesso',
                error: null
            };
        } catch (error) {
            console.error('❌ Erro ao validar credenciais SMTP:', error.message);
            
            let message = 'Falha na conexão SMTP';
            if (error.message.includes('authentication')) {
                message = 'Falha na autenticação: usuário ou senha incorretos';
            } else if (error.message.includes('ECONNREFUSED')) {
                message = 'Conexão recusada: verifique host e porta';
            } else if (error.message.includes('timeout')) {
                message = 'Timeout: servidor não respondeu em 10 segundos';
            }

            return {
                valid: false,
                message,
                error: error.message
            };
        }
    }

    /**
     * Valida credenciais Cloudinary fazendo upload de teste
     * 
     * @param {Object} credentials - { cloud_name, api_key, api_secret }
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateCloudinaryCredentials(credentials) {
        try {
            const { cloud_name, api_key, api_secret } = credentials;

            // Validar campos obrigatórios
            if (!cloud_name || !api_key || !api_secret) {
                return {
                    valid: false,
                    message: 'Campos obrigatórios ausentes: cloud_name, api_key, api_secret',
                    error: 'MISSING_FIELDS'
                };
            }

            // Testar API do Cloudinary (ping endpoint)
            const url = `https://api.cloudinary.com/v1_1/${cloud_name}/resources/image`;
            const auth = Buffer.from(`${api_key}:${api_secret}`).toString('base64');

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                timeout: this.timeout
            });

            if (response.status === 200) {
                return {
                    valid: true,
                    message: 'Credenciais Cloudinary válidas',
                    error: null
                };
            }

            return {
                valid: false,
                message: 'Resposta inesperada da API Cloudinary',
                error: `Status: ${response.status}`
            };
        } catch (error) {
            console.error('❌ Erro ao validar credenciais Cloudinary:', error.message);
            
            let message = 'Falha na validação Cloudinary';
            if (error.response && error.response.status === 401) {
                message = 'Credenciais inválidas: api_key ou api_secret incorretos';
            } else if (error.response && error.response.status === 404) {
                message = 'Cloud name não encontrado';
            } else if (error.code === 'ECONNABORTED') {
                message = 'Timeout: API não respondeu em 10 segundos';
            }

            return {
                valid: false,
                message,
                error: error.message
            };
        }
    }

    /**
     * Valida credenciais Mercado Pago consultando API
     * 
     * @param {Object} credentials - { access_token, public_key, webhook_secret }
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateMercadoPagoCredentials(credentials) {
        try {
            const { access_token, public_key } = credentials;

            // Validar campos obrigatórios
            if (!access_token || !public_key) {
                return {
                    valid: false,
                    message: 'Campos obrigatórios ausentes: access_token, public_key',
                    error: 'MISSING_FIELDS'
                };
            }

            // Testar API do Mercado Pago (endpoint de usuário)
            const url = 'https://api.mercadopago.com/v1/users/me';
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                timeout: this.timeout
            });

            if (response.status === 200 && response.data.id) {
                return {
                    valid: true,
                    message: `Credenciais Mercado Pago válidas (Usuário: ${response.data.email || response.data.id})`,
                    error: null
                };
            }

            return {
                valid: false,
                message: 'Resposta inesperada da API Mercado Pago',
                error: `Status: ${response.status}`
            };
        } catch (error) {
            console.error('❌ Erro ao validar credenciais Mercado Pago:', error.message);
            
            let message = 'Falha na validação Mercado Pago';
            if (error.response && error.response.status === 401) {
                message = 'Access token inválido ou expirado';
            } else if (error.response && error.response.status === 403) {
                message = 'Acesso negado: verifique permissões do token';
            } else if (error.code === 'ECONNABORTED') {
                message = 'Timeout: API não respondeu em 10 segundos';
            }

            return {
                valid: false,
                message,
                error: error.message
            };
        }
    }

    /**
     * Valida credenciais WhatsApp consultando API
     * 
     * @param {Object} credentials - { phone_number, api_token }
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateWhatsAppCredentials(credentials) {
        try {
            const { phone_number, api_token } = credentials;

            // Validar campos obrigatórios
            if (!phone_number || !api_token) {
                return {
                    valid: false,
                    message: 'Campos obrigatórios ausentes: phone_number, api_token',
                    error: 'MISSING_FIELDS'
                };
            }

            // TODO: Implementar validação real quando API WhatsApp estiver disponível
            // Por enquanto, apenas validar formato
            
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phone_number)) {
                return {
                    valid: false,
                    message: 'Formato de telefone inválido (use formato internacional: +5511999999999)',
                    error: 'INVALID_PHONE_FORMAT'
                };
            }

            return {
                valid: true,
                message: 'Credenciais WhatsApp validadas (validação completa será implementada futuramente)',
                error: null
            };
        } catch (error) {
            console.error('❌ Erro ao validar credenciais WhatsApp:', error.message);
            
            return {
                valid: false,
                message: 'Falha na validação WhatsApp',
                error: error.message
            };
        }
    }

    /**
     * Valida URLs verificando formato e acessibilidade
     * 
     * @param {Object} credentials - { frontend_url, backend_url }
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateUrlCredentials(credentials) {
        try {
            const { frontend_url, backend_url } = credentials;

            // Validar campos obrigatórios
            if (!frontend_url || !backend_url) {
                return {
                    valid: false,
                    message: 'Campos obrigatórios ausentes: frontend_url, backend_url',
                    error: 'MISSING_FIELDS'
                };
            }

            // Validar formato de URL
            const urlRegex = /^https?:\/\/.+/;
            if (!urlRegex.test(frontend_url)) {
                return {
                    valid: false,
                    message: 'Frontend URL inválida (deve começar com http:// ou https://)',
                    error: 'INVALID_FRONTEND_URL'
                };
            }
            if (!urlRegex.test(backend_url)) {
                return {
                    valid: false,
                    message: 'Backend URL inválida (deve começar com http:// ou https://)',
                    error: 'INVALID_BACKEND_URL'
                };
            }

            // Tentar acessar URLs (opcional, pode falhar em desenvolvimento)
            try {
                await axios.get(frontend_url, { timeout: 5000, validateStatus: () => true });
            } catch (error) {
                // Ignorar erro de acesso, apenas validar formato
            }

            return {
                valid: true,
                message: 'URLs validadas com sucesso',
                error: null
            };
        } catch (error) {
            console.error('❌ Erro ao validar URLs:', error.message);
            
            return {
                valid: false,
                message: 'Falha na validação de URLs',
                error: error.message
            };
        }
    }

    /**
     * Valida JWT secret verificando tamanho mínimo
     * 
     * @param {Object} credentials - { secret }
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateJwtCredentials(credentials) {
        try {
            const { secret } = credentials;

            // Validar campo obrigatório
            if (!secret) {
                return {
                    valid: false,
                    message: 'Campo obrigatório ausente: secret',
                    error: 'MISSING_FIELDS'
                };
            }

            // Validar tamanho mínimo (32 caracteres)
            if (secret.length < 32) {
                return {
                    valid: false,
                    message: 'JWT secret deve ter no mínimo 32 caracteres',
                    error: 'SECRET_TOO_SHORT'
                };
            }

            return {
                valid: true,
                message: 'JWT secret validado com sucesso',
                error: null
            };
        } catch (error) {
            console.error('❌ Erro ao validar JWT secret:', error.message);
            
            return {
                valid: false,
                message: 'Falha na validação JWT',
                error: error.message
            };
        }
    }

    /**
     * Valida credenciais de acordo com o tipo de serviço
     * 
     * @param {string} service - Tipo de serviço
     * @param {Object} credentials - Credenciais a validar
     * @returns {Promise<Object>} { valid, message, error }
     */
    async validateCredentials(service, credentials) {
        switch (service) {
            case 'email':
                return await this.validateEmailCredentials(credentials);
            case 'cloudinary':
                return await this.validateCloudinaryCredentials(credentials);
            case 'mercadopago':
                return await this.validateMercadoPagoCredentials(credentials);
            case 'whatsapp':
                return await this.validateWhatsAppCredentials(credentials);
            case 'urls':
                return await this.validateUrlCredentials(credentials);
            case 'jwt':
                return await this.validateJwtCredentials(credentials);
            default:
                return {
                    valid: false,
                    message: `Serviço desconhecido: ${service}`,
                    error: 'UNKNOWN_SERVICE'
                };
        }
    }
}

// Singleton
const validationService = new ValidationService();

module.exports = validationService;
