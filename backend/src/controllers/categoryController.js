const db = require('../config/database');
const { logActivity } = require('../utils/activityLogger');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const categoryController = {
    getAll: asyncHandler(async (req, res) => {
        const [categories] = await db.execute(
            'SELECT * FROM product_categories ORDER BY name ASC'
        );
        res.json(categories);
    }),

    create: asyncHandler(async (req, res) => {
        const { name, slug, has_sizes } = req.body;

        if (!name) {
            throw new AppError('Nome da categoria é obrigatório', 400);
        }

        const generatedSlug = slug || name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        try {
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
            if (error.code === 'ER_DUP_ENTRY') {
                throw new AppError('Slug já existe', 409);
            }
            throw error;
        }
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, slug, has_sizes } = req.body;

        const [oldData] = await db.execute(
            'SELECT * FROM product_categories WHERE id = ?',
            [id]
        );

        if (oldData.length === 0) {
            throw new AppError('Categoria não encontrada', 404);
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
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const [products] = await db.execute(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );

        if (products[0].count > 0) {
            throw new AppError('Não é possível excluir categoria com produtos vinculados', 400);
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
    })
};

module.exports = categoryController;
