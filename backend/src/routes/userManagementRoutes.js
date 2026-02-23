const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Todas as rotas requerem autenticação e permissão de developer ou administrator
router.use(authenticate);
router.use(authorize('developer', 'administrator'));

// Listar usuários administrativos
router.get('/', apiLimiter, userManagementController.getAll);

// Criar novo usuário
router.post('/', apiLimiter, userManagementController.create);

// Atualizar usuário
router.put('/:id', apiLimiter, userManagementController.update);

// Deletar usuário
router.delete('/:id', apiLimiter, userManagementController.delete);

// Resetar senha
router.post('/:id/reset-password', apiLimiter, userManagementController.resetPassword);

module.exports = router;
