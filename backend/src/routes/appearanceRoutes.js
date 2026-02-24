const express = require('express');
const router = express.Router();
const appearanceController = require('../controllers/appearanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { checkFeature } = require('../middleware/featureCheck');

// Rota pública para obter configurações (para aplicar no site)
router.get('/settings', apiLimiter, appearanceController.getSettings);

// Rotas protegidas (apenas developer e administrator)
router.use(authenticate);
router.use(authorize('developer', 'administrator'));
router.use(checkFeature('feature_appearance'));

// Obter temas personalizados (custom1 e custom2)
router.get('/custom-themes', apiLimiter, appearanceController.getCustomThemes);

// Obter tema ativo
router.get('/active-theme', apiLimiter, appearanceController.getActiveTheme);

// Salvar tema personalizado (custom1 ou custom2)
router.post('/save-custom-theme', apiLimiter, appearanceController.saveCustomTheme);

// Aplicar tema no site
router.post('/apply-active-theme', apiLimiter, appearanceController.applyActiveTheme);

module.exports = router;
