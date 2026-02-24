const express = require('express');
const router = express.Router();
const developerSettingsController = require('../controllers/developerSettingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Todas as rotas são protegidas e apenas para developers
router.use(authenticate);
router.use(authorize('developer'));

// Obter todas as configurações
router.get('/', apiLimiter, developerSettingsController.getSettings);

// Verificar se uma feature está ativa
router.get('/check/:feature', apiLimiter, developerSettingsController.checkFeature);

// Atualizar uma configuração específica
router.put('/setting', apiLimiter, developerSettingsController.updateSetting);

// Atualizar múltiplas configurações
router.put('/settings', apiLimiter, developerSettingsController.updateMultipleSettings);

// Resetar para padrão
router.post('/reset', apiLimiter, developerSettingsController.resetToDefaults);

module.exports = router;
