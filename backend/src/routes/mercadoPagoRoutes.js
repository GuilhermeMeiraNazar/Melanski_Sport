const express = require('express');
const router = express.Router();
const mercadoPagoController = require('../controllers/mercadoPagoController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Rota pública para obter Public Key
router.get('/public-key', apiLimiter, mercadoPagoController.getPublicKey);

// Webhook do Mercado Pago (público, sem autenticação)
router.post('/webhook', mercadoPagoController.webhook);

// Rotas protegidas
router.use(authenticate);

// Criar preferência de pagamento (qualquer usuário autenticado)
router.post('/create-preference', apiLimiter, mercadoPagoController.createPreference);

// Buscar informações de pagamento (apenas admin e developer)
router.get('/payment/:paymentId', authorize('developer', 'administrator'), apiLimiter, mercadoPagoController.getPayment);

// Reembolsar pagamento (apenas admin e developer)
router.post('/refund/:paymentId', authorize('developer', 'administrator'), apiLimiter, mercadoPagoController.refundPayment);

module.exports = router;
