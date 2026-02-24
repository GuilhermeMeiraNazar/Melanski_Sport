const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const mercadoPagoService = require('../services/mercadoPagoService');

const mercadoPagoController = {
    /**
     * Obter Public Key do Mercado Pago
     * Rota pública para o frontend usar
     */
    getPublicKey: asyncHandler(async (req, res) => {
        console.log('🔑 Obtendo Public Key do Mercado Pago...');

        const isConfigured = await mercadoPagoService.isConfigured();
        
        if (!isConfigured) {
            return res.json({
                configured: false,
                publicKey: null,
                message: 'Mercado Pago não está configurado'
            });
        }

        const publicKey = await mercadoPagoService.getPublicKey();

        res.json({
            configured: true,
            publicKey: publicKey
        });
    }),

    /**
     * Criar preferência de pagamento
     * Chamado quando o cliente finaliza o pedido
     */
    createPreference: asyncHandler(async (req, res) => {
        const { orderId } = req.body;

        console.log(`💳 Criando preferência de pagamento para pedido ${orderId}...`);

        if (!orderId) {
            throw new AppError('ID do pedido é obrigatório', 400);
        }

        // Buscar dados do pedido
        const [orders] = await db.execute(
            `SELECT * FROM orders WHERE id = ?`,
            [orderId]
        );

        if (orders.length === 0) {
            throw new AppError('Pedido não encontrado', 404);
        }

        const order = orders[0];

        // Buscar itens do pedido
        const [items] = await db.execute(
            `SELECT * FROM order_items WHERE order_id = ?`,
            [orderId]
        );

        if (items.length === 0) {
            throw new AppError('Pedido sem itens', 400);
        }

        // Preparar dados para o Mercado Pago
        const orderData = {
            orderId: order.id,
            items: items,
            payer: {
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone,
                address: order.delivery_address,
                zipCode: order.delivery_zip_code || ''
            },
            backUrls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pedido-confirmado?orderId=${orderId}`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pedido-falhou?orderId=${orderId}`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pedido-pendente?orderId=${orderId}`
            },
            notificationUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/mercadopago/webhook`
        };

        // Criar preferência no Mercado Pago
        const preference = await mercadoPagoService.createPreference(orderData);

        // Salvar ID da preferência no pedido
        await db.execute(
            `UPDATE orders SET mercadopago_preference_id = ? WHERE id = ?`,
            [preference.id, orderId]
        );

        console.log(`✅ Preferência criada: ${preference.id}`);

        res.json({
            preferenceId: preference.id,
            initPoint: preference.init_point,
            sandboxInitPoint: preference.sandbox_init_point
        });
    }),

    /**
     * Webhook do Mercado Pago
     * Recebe notificações de pagamento
     */
    webhook: asyncHandler(async (req, res) => {
        console.log('🔔 Webhook recebido do Mercado Pago:', req.body);

        try {
            const notification = req.body;

            // Processar notificação
            const result = await mercadoPagoService.processWebhook(notification);

            if (result.type === 'payment') {
                const { status, orderId, paymentId } = result;

                console.log(`💳 Pagamento ${paymentId} - Status: ${status} - Pedido: ${orderId}`);

                // Atualizar status do pedido baseado no status do pagamento
                let orderStatus = 'pending';
                if (status === 'approved') {
                    orderStatus = 'completed';
                } else if (status === 'rejected' || status === 'cancelled') {
                    orderStatus = 'cancelled';
                }

                // Atualizar pedido
                await db.execute(
                    `UPDATE orders 
                    SET status = ?, 
                        mercadopago_payment_id = ?,
                        mercadopago_payment_status = ?
                    WHERE id = ?`,
                    [orderStatus, paymentId, status, orderId]
                );

                console.log(`✅ Pedido ${orderId} atualizado para status: ${orderStatus}`);
            }

            // Responder 200 OK para o Mercado Pago
            res.status(200).send('OK');
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            // Mesmo com erro, responder 200 para não receber a notificação novamente
            res.status(200).send('OK');
        }
    }),

    /**
     * Buscar informações de um pagamento
     */
    getPayment: asyncHandler(async (req, res) => {
        const { paymentId } = req.params;

        console.log(`🔍 Buscando pagamento ${paymentId}...`);

        const payment = await mercadoPagoService.getPayment(paymentId);

        res.json(payment);
    }),

    /**
     * Reembolsar um pagamento
     */
    refundPayment: asyncHandler(async (req, res) => {
        const { paymentId } = req.params;
        const { amount } = req.body;

        console.log(`💸 Reembolsando pagamento ${paymentId}...`);

        const refund = await mercadoPagoService.refundPayment(paymentId, amount);

        // Atualizar status do pedido
        const [orders] = await db.execute(
            `SELECT id FROM orders WHERE mercadopago_payment_id = ?`,
            [paymentId]
        );

        if (orders.length > 0) {
            await db.execute(
                `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
                [orders[0].id]
            );
        }

        console.log(`✅ Reembolso processado: ${refund.id}`);

        res.json(refund);
    })
};

module.exports = mercadoPagoController;
