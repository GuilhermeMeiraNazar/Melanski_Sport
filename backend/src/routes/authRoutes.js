const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-code', authController.resendVerificationCode);
router.get('/validate', authenticate, authController.validateToken);

// Rotas protegidas para atualização de perfil
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

// Rotas de recuperação de senha
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
