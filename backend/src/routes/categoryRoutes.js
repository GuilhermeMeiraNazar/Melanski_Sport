const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidator');
const { createLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.get('/', apiLimiter, categoryController.getAll);
router.post('/', authenticate, authorize('developer', 'administrator'), createLimiter, validate(createCategorySchema), categoryController.create);
router.put('/:id', authenticate, authorize('developer', 'administrator'), apiLimiter, validate(updateCategorySchema), categoryController.update);
router.delete('/:id', authenticate, authorize('developer', 'administrator'), apiLimiter, categoryController.delete);

module.exports = router;
