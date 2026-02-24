const axios = require('axios');
const credentialsService = require('./credentialsService');

/**
 * Serviço de Integração com Mercado Pago
 * 
 * CONFIGURAÇÃO:
 * - Credenciais podem ser configuradas via painel Developer (recomendado)
 * - Ou via .env como fallback (legado)
 * 
 * Para obter as credenciais:
 * 1. Acesse: https://www.mercadopago.com.br/developers
 * 2. Faça login na sua conta
 * 3. Vá em "Suas integrações" > "Credenciais"
 * 4. Copie o Access Token e Public Key
 * 
 * IMPORTANTE:
 * - Use credenciais de TESTE durante desenvolvimento
 * - Use credenciais de PRODUÇÃO apenas quando for ao ar
 */

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com';

class MercadoPagoService {
    constructor() {
        this.apiUrl = MERCADOPAGO_API_URL;
        this.credentialsCache = null;
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutos
    }

    /**
     * Obtém credenciais do Mercado Pago (com cache)
     */
    async getCredentials() {
        // Verificar cache
        if (this.credentialsCache && this.cacheTimestamp && 
            Date.now() - this.cacheTimestamp < this.cacheDuration) {
            return this.credentialsCache;
        }

        try {
            // Tentar obter do credentialsService
            const credentials = await credentialsService.getCredentials('mercadopago');
            this.credentialsCache = credentials;
            this.cacheTimestamp = Date.now();
            return credentials;
        } catch (error) {
            // Fallback para .env
            console.warn('⚠️ Usando credenciais do Mercado Pago do .env (fallback)');
            const envCredentials = {
                access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
                public_key: process.env.MERCADOPAGO_PUBLIC_KEY || '',
                webhook_secret: process.env.MERCADOPAGO_WEBHOOK_SECRET || ''
            };
            this.credentialsCache = envCredentials;
            this.cacheTimestamp = Date.now();
            return envCredentials;
        }
    }

    /**
     * Verifica se o Mercado Pago está configurado
     */
    async isConfigured() {
        const credentials = await this.getCredentials();
        return !!(credentials.access_token && credentials.public_key);
    }

    /**
     * Cria uma preferência de pagamento
     * @param {Object} orderData - Dados do pedido
     * @returns {Promise<Object>} - Preferência criada
     */
    async createPreference(orderData) {
        const credentials = await this.getCredentials();
        
        if (!credentials.access_token || !credentials.public_key) {
            throw new Error('Mercado Pago não está configurado. Configure as credenciais no painel Developer');
        }

        try {
            const {
                orderId,
                items,
                payer,
                backUrls,
                notificationUrl
            } = orderData;

            // Obter URLs do sistema
            const urlCredentials = await credentialsService.getCredentials('urls').catch(() => ({
                frontend_url: process.env.FRONTEND_URL,
                backend_url: process.env.BACKEND_URL
            }));

            // Montar itens do pedido
            const preferenceItems = items.map(item => ({
                id: String(item.product_id),
                title: item.product_name,
                description: `Tamanho: ${item.product_size}`,
                picture_url: item.product_image,
                category_id: 'fashion',
                quantity: item.quantity,
                unit_price: parseFloat(item.unit_price),
                currency_id: 'BRL'
            }));

            // Criar preferência
            const preference = {
                items: preferenceItems,
                payer: {
                    name: payer.name,
                    email: payer.email,
                    phone: {
                        area_code: payer.phone?.substring(0, 2) || '00',
                        number: payer.phone?.substring(2) || '000000000'
                    },
                    address: {
                        street_name: payer.address || '',
                        street_number: 0,
                        zip_code: payer.zipCode || ''
                    }
                },
                back_urls: {
                    success: backUrls?.success || `${urlCredentials.frontend_url}/pedido-confirmado`,
                    failure: backUrls?.failure || `${urlCredentials.frontend_url}/pedido-falhou`,
                    pending: backUrls?.pending || `${urlCredentials.frontend_url}/pedido-pendente`
                },
                auto_return: 'approved',
                notification_url: notificationUrl || `${urlCredentials.backend_url}/api/mercadopago/webhook`,
                external_reference: String(orderId),
                statement_descriptor: 'MELANSKI SPORT',
                payment_methods: {
                    excluded_payment_types: [],
                    installments: 12 // Até 12 parcelas
                },
                shipments: {
                    cost: 0,
                    mode: 'not_specified'
                }
            };

            const response = await axios.post(
                `${this.apiUrl}/checkout/preferences`,
                preference,
                {
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                id: response.data.id,
                init_point: response.data.init_point, // URL para redirecionar o cliente
                sandbox_init_point: response.data.sandbox_init_point // URL de teste
            };
        } catch (error) {
            console.error('Erro ao criar preferência no Mercado Pago:', error.response?.data || error.message);
            throw new Error('Erro ao processar pagamento. Tente novamente.');
        }
    }

    /**
     * Busca informações de um pagamento
     * @param {string} paymentId - ID do pagamento
     * @returns {Promise<Object>} - Dados do pagamento
     */
    async getPayment(paymentId) {
        const credentials = await this.getCredentials();
        
        if (!credentials.access_token) {
            throw new Error('Mercado Pago não está configurado');
        }

        try {
            const response = await axios.get(
                `${this.apiUrl}/v1/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`
                    }
                }
            );

            return {
                id: response.data.id,
                status: response.data.status, // approved, pending, rejected, cancelled
                status_detail: response.data.status_detail,
                transaction_amount: response.data.transaction_amount,
                currency_id: response.data.currency_id,
                date_created: response.data.date_created,
                date_approved: response.data.date_approved,
                external_reference: response.data.external_reference,
                payer: response.data.payer,
                payment_method_id: response.data.payment_method_id,
                payment_type_id: response.data.payment_type_id
            };
        } catch (error) {
            console.error('Erro ao buscar pagamento:', error.response?.data || error.message);
            throw new Error('Erro ao buscar informações do pagamento');
        }
    }

    /**
     * Processa notificação de webhook
     * @param {Object} notification - Dados da notificação
     * @returns {Promise<Object>} - Dados processados
     */
    async processWebhook(notification) {
        try {
            const { type, data } = notification;

            // Tipos de notificação:
            // - payment: Notificação de pagamento
            // - merchant_order: Notificação de pedido

            if (type === 'payment') {
                const paymentId = data.id;
                const paymentInfo = await this.getPayment(paymentId);

                return {
                    type: 'payment',
                    paymentId,
                    status: paymentInfo.status,
                    orderId: paymentInfo.external_reference,
                    amount: paymentInfo.transaction_amount,
                    paymentInfo
                };
            }

            return {
                type,
                data
            };
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            throw error;
        }
    }

    /**
     * Reembolsa um pagamento
     * @param {string} paymentId - ID do pagamento
     * @param {number} amount - Valor a reembolsar (opcional, padrão: total)
     * @returns {Promise<Object>} - Dados do reembolso
     */
    async refundPayment(paymentId, amount = null) {
        const credentials = await this.getCredentials();
        
        if (!credentials.access_token) {
            throw new Error('Mercado Pago não está configurado');
        }

        try {
            const refundData = amount ? { amount } : {};

            const response = await axios.post(
                `${this.apiUrl}/v1/payments/${paymentId}/refunds`,
                refundData,
                {
                    headers: {
                        'Authorization': `Bearer ${credentials.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                id: response.data.id,
                payment_id: response.data.payment_id,
                amount: response.data.amount,
                status: response.data.status,
                date_created: response.data.date_created
            };
        } catch (error) {
            console.error('Erro ao reembolsar pagamento:', error.response?.data || error.message);
            throw new Error('Erro ao processar reembolso');
        }
    }

    /**
     * Obtém a Public Key para uso no frontend
     * @returns {Promise<string>} - Public Key
     */
    async getPublicKey() {
        const credentials = await this.getCredentials();
        return credentials.public_key;
    }
}

module.exports = new MercadoPagoService();
