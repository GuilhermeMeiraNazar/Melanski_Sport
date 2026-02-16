const productService = require('../services/productService');

const productController = {
    // Listar
    getAll: async (req, res) => {
        try {
            const products = await productService.getAllProducts();
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
    },

    // Criar
    create: async (req, res) => {
        try {
            const newProduct = await productService.createProduct(req.body);
            res.status(201).json(newProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar produto' });
        }
    },

    // Atualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedProduct = await productService.updateProduct(id, req.body);
            res.json(updatedProduct);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
    },

    // Deletar
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await productService.deleteProduct(id);
            res.json({ message: 'Produto excluído com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao excluir produto' });
        }
    }
};

module.exports = productController;