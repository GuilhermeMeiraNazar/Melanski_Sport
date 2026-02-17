const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Rota para pegar as opções da sidebar (Times, Categorias, etc)
router.get('/filters', storeController.getSidebarOptions);

// Rota para listar produtos (Home)
router.get('/products', storeController.listProducts);

module.exports = router;