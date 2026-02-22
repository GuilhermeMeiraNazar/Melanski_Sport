const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', productController.getAll);
router.post('/', authenticate, authorize('developer', 'administrator', 'operator'), productController.create);
router.put('/:id', authenticate, authorize('developer', 'administrator', 'operator'), productController.update);
router.delete('/:id', authenticate, authorize('developer', 'administrator'), productController.delete);

module.exports = router;