const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', categoryController.getAll);
router.post('/', authenticate, authorize('developer', 'administrator'), categoryController.create);
router.put('/:id', authenticate, authorize('developer', 'administrator'), categoryController.update);
router.delete('/:id', authenticate, authorize('developer', 'administrator'), categoryController.delete);

module.exports = router;
