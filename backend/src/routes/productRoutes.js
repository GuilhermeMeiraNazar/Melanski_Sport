const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');


router.get('/', productController.getAll);
router.post('/', productController.create);
router.put('/:id', productController.update); // O erro costuma ser aqui
router.delete('/:id', productController.delete);

module.exports = router;