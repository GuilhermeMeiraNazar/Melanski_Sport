const productService = require('../services/productService');
const { uploadImage } = require('../services/uploadService');

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

    // Criar (Atualizado com lógica de Imagem)
    create: async (req, res) => {
        try {
            const data = req.body;

            // Se houver imagens no array (Base64), fazemos o upload antes de salvar
            if (data.images && data.images.length > 0) {
                const uploadPromises = data.images.map(async (image) => {
                    // Se for uma string base64, faz upload. Se já for link (ex: edição), mantém.
                    if (image.startsWith('data:image')) {
                        return await uploadImage(image);
                    }
                    return image;
                });
                
                // Substitui o array de base64 por array de Links do Cloudinary
                data.images = await Promise.all(uploadPromises);
            }

            const newProduct = await productService.createProduct(data);
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Erro no create controller:', error);
            res.status(500).json({ error: 'Erro ao criar produto' });
        }
    },

    // Atualizar (Atualizado com lógica de Imagem)
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            // Mesma lógica de upload para edição, caso adicione novas fotos
            if (data.images && data.images.length > 0) {
                const uploadPromises = data.images.map(async (image) => {
                    if (image.startsWith('data:image')) {
                        return await uploadImage(image);
                    }
                    return image;
                });
                data.images = await Promise.all(uploadPromises);
            }

            const updatedProduct = await productService.updateProduct(id, data);
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