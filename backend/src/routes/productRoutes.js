const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');
const { createLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.get('/', apiLimiter, productController.getAll);
router.post('/', authenticate, authorize('developer', 'administrator', 'operator'), createLimiter, validate(createProductSchema), productController.create);
router.put('/:id', authenticate, authorize('developer', 'administrator', 'operator'), apiLimiter, validate(updateProductSchema), productController.update);
router.delete('/:id', authenticate, authorize('developer', 'administrator'), apiLimiter, productController.delete);

module.exports = router;