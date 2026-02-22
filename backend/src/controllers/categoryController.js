const db = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

const categoryController = {
    getAll: async (req, res) => {
        try {
            const [categories] = await db.execute(
                'SELECT * FROM product_categories ORDER BY name ASC'
            );
            res.json(categories);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            res.status(500).json({ error: 'Erro ao buscar categorias' });
        }
    },

    create: async (req, res) => {
        try {
            const { name, slug, has_sizes } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
            }

            const generatedSlug = slug || name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const [result] = await db.execute(
                'INSERT INTO product_categories (name, slug, has_sizes) VALUES (?, ?, ?)',
                [name, generatedSlug, has_sizes ? 1 : 0]
            );

            if (req.user) {
                await logActivity(
                    req.user.id,
                    'Criou categoria',
                    'product_categories',
                    result.insertId,
                    { name, slug: generatedSlug, has_sizes: has_sizes ? 1 : 0 }
                );
            }

            res.status(201).json({ 
                message: 'Categoria criada com sucesso',
                id: result.insertId,
                name,
                slug: generatedSlug,
                has_sizes: has_sizes ? 1 : 0
            });
        } catch (error) {
            console.error('❌ Erro ao criar categoria:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Slug já existe' });
            }
            res.status(500).json({ error: 'Erro ao criar categoria: ' + error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, slug, has_sizes } = req.body;

            const [oldData] = await db.execute(
                'SELECT * FROM product_categories WHERE id = ?',
                [id]
            );

            if (oldData.length === 0) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }

            await db.execute(
                'UPDATE product_categories SET name = ?, slug = ?, has_sizes = ? WHERE id = ?',
                [name, slug, has_sizes ? 1 : 0, id]
            );

            if (req.user) {
                await logActivity(
                    req.user.id,
                    'Atualizou categoria',
                    'product_categories',
                    id,
                    { old: oldData[0], new: { name, slug, has_sizes: has_sizes ? 1 : 0 } }
                );
            }

            res.json({ message: 'Categoria atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            res.status(500).json({ error: 'Erro ao atualizar categoria' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const [products] = await db.execute(
                'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
                [id]
            );

            if (products[0].count > 0) {
                return res.status(400).json({ 
                    error: 'Não é possível excluir categoria com produtos vinculados' 
                });
            }

            const [oldData] = await db.execute(
                'SELECT * FROM product_categories WHERE id = ?',
                [id]
            );

            await db.execute('DELETE FROM product_categories WHERE id = ?', [id]);

            if (req.user && oldData.length > 0) {
                await logActivity(
                    req.user.id,
                    'Deletou categoria',
                    'product_categories',
                    id,
                    oldData[0]
                );
            }

            res.json({ message: 'Categoria removida com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            res.status(500).json({ error: 'Erro ao deletar categoria' });
        }
    }
};

module.exports = categoryController;
