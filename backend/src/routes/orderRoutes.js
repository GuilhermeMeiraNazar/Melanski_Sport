const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema, updateStatusSchema } = require('../validators/orderValidator');
const { apiLimiter, createLimiter } = require('../middleware/rateLimiter');

// Listar pedidos - Apenas Developer, Administrator, Operator
router.get(
  '/',
  authenticate,
  authorize('developer', 'administrator', 'operator'),
  apiLimiter,
  orderController.getAll
);

// Buscar pedido específico - Apenas Developer, Administrator, Operator
router.get(
  '/:id',
  authenticate,
  authorize('developer', 'administrator', 'operator'),
  apiLimiter,
  orderController.getById
);

// Criar pedido - Qualquer usuário autenticado ou público (carrinho)
router.post(
  '/',
  createLimiter,
  validate(createOrderSchema),
  orderController.create
);

// Atualizar status - Apenas Developer, Administrator, Operator
router.patch(
  '/:id/status',
  authenticate,
  authorize('developer', 'administrator', 'operator'),
  apiLimiter,
  validate(updateStatusSchema),
  orderController.updateStatus
);

module.exports = router;
