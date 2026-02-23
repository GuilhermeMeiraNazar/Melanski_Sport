const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Todas as rotas requerem autenticação e permissão de developer ou administrator
router.use(authenticate);
router.use(authorize('developer', 'administrator'));

// Exportar estoque
router.get('/inventory', apiLimiter, exportController.exportInventory);

// Exportar clientes
router.get('/customers', apiLimiter, exportController.exportCustomers);

// Exportar categorias
router.get('/categories', apiLimiter, exportController.exportCategories);

// Exportar logs
router.get('/activity-logs', apiLimiter, exportController.exportActivityLogs);

module.exports = router;
