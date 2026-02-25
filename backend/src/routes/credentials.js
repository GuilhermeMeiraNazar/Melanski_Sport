const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const developerAuth = require('../middleware/developerAuth');
const credentialsController = require('../controllers/credentialsController');

/**
 * Rotas de Gerenciamento de Credenciais
 * 
 * Todas as rotas exigem:
 * - Autenticação JWT
 * - Role 'developer'
 */

// Aplicar autenticação e autorização em todas as rotas
router.use(authenticate);
router.use(developerAuth);

// Rotas
router.get('/', credentialsController.listServices);
router.get('/:service', credentialsController.getCredentials);
router.put('/:service', credentialsController.updateCredentials);
router.post('/test/:service', credentialsController.testConnection);
router.delete('/:service', credentialsController.deleteCredentials);
router.post('/reset-all', credentialsController.resetAllCredentials); // Nova rota de reset
router.get('/:service/audit', credentialsController.getAuditHistory);

module.exports = router;
