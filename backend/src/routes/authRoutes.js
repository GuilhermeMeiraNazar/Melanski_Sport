const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    updateProfileSchema,
    changePasswordSchema,
    requestPasswordResetSchema,
    resetPasswordSchema
} = require('../validators/authValidator');

// Rotas públicas com rate limiting mais restritivo
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-code', authLimiter, validate(requestPasswordResetSchema), authController.resendVerificationCode);
router.post('/request-password-reset', authLimiter, validate(requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Rotas protegidas com rate limiting normal
router.get('/validate', authenticate, apiLimiter, authController.validateToken);
router.put('/profile', authenticate, apiLimiter, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', authenticate, authLimiter, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
