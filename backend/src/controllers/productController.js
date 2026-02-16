const uploadService = require('../services/uploadService');
const db = require('../config/database');

const productController = {
    getAll: async (req, res) => {
        try {
            // Query usando os nomes exatos das suas tabelas: product_images e product_inventory
            const query = `
                SELECT p.*, 
                GROUP_CONCAT(DISTINCT i.image_url) as all_images,
                GROUP_CONCAT(DISTINCT CONCAT(inv.size, ':', inv.quantity)) as stock_data
                FROM products p 
                LEFT JOIN product_images i ON p.id = i.product_id 
                LEFT JOIN product_inventory inv ON p.id = inv.product_id
                GROUP BY p.id
            `;
            const [rows] = await db.execute(query);
            
            const products = rows.map(prod => {
                let stockObj = {};
                if (prod.stock_data) {
                    prod.stock_data.split(',').forEach(item => {
                        const parts = item.split(':');
                        if(parts.length === 2) {
                            const [size, qty] = parts;
                            stockObj[size] = parseInt(qty) || 0;
                        }
                    });
                }

                return {
                    ...prod,
                    price: prod.sale_price, // Para o Admin.jsx exibir o preço corretamente
                    images: prod.all_images ? prod.all_images.split(',') : [],
                    // Se for roupa, envia o objeto de tamanhos. Se não, pega o primeiro valor de estoque.
                    stock: (prod.category && prod.category.toUpperCase() === 'ROUPA') ? stockObj : (Object.values(stockObj)[0] || 0)
                };
            });

            res.json(products);
        } catch (error) {
            console.error("Erro no getAll:", error);
            res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
    },

    create: async (req, res) => {
        const connection = await db.getConnection(); 
        try {
            await connection.beginTransaction();
            const data = req.body;

            // 1. Inserir em products (Nomes de colunas conforme seu CSV)
            const queryProd = `
                INSERT INTO products 
                (name, description, category, team, type, gender, cost_price, sale_price, has_discount, discount_percentage) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(queryProd, [
                data.name,
                data.description || '',
                data.category,
                data.team || '',
                data.type || data.origin || '', 
                data.gender || '',
                data.costPrice || 0,
                data.salePrice || 0,
                data.hasDiscount ? 1 : 0,
                data.discountPercentage || 0
            ]);

            const newProductId = result.insertId;

            // 2. Inserir Estoque na tabela product_inventory
            if (data.category && data.category.toUpperCase() === 'ROUPA' && typeof data.stock === 'object') {
                for (const [size, qty] of Object.entries(data.stock)) {
                    await connection.execute(
                        'INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)',
                        [newProductId, size, qty]
                    );
                }
            } else {
                // Caso não seja roupa ou venha um valor único de estoque
                await connection.execute(
                    'INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)',
                    [newProductId, 'Geral', data.stock || 0]
                );
            }

            // 3. Salvar Imagens no Cloudinary e na tabela product_images
            if (data.images && data.images.length > 0) {
                const imagesToProcess = data.images.slice(0, 5);
                for (let i = 0; i < imagesToProcess.length; i++) {
                    const img = imagesToProcess[i];
                    let urlToSave = img.startsWith('data:image') 
                        ? await uploadService.uploadImage(img) 
                        : img;

                    await connection.execute(
                        'INSERT INTO product_images (image_url, is_main, product_id) VALUES (?, ?, ?)',
                        [urlToSave, i === 0 ? 1 : 0, newProductId]
                    );
                }
            }

            await connection.commit();
            res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Erro no create:", error);
            res.status(500).json({ error: 'Erro ao cadastrar produto.' });
        } finally {
            if (connection) connection.release();
        }
    },

    update: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { id } = req.params;
            const data = req.body;

            const queryUpdate = `
                UPDATE products SET 
                name=?, description=?, category=?, team=?, type=?, gender=?, 
                cost_price=?, sale_price=?, has_discount=?, discount_percentage=?
                WHERE id=?
            `;

            await connection.execute(queryUpdate, [
                data.name, data.description || '', data.category, data.team || '', 
                data.type || data.origin || '', data.gender || '', 
                data.costPrice, data.salePrice, 
                data.hasDiscount ? 1 : 0, data.discountPercentage || 0, id
            ]);

            // Atualizar estoque na product_inventory (limpa e insere)
            await connection.execute('DELETE FROM product_inventory WHERE product_id = ?', [id]);
            if (data.category && data.category.toUpperCase() === 'ROUPA' && typeof data.stock === 'object') {
                for (const [size, qty] of Object.entries(data.stock)) {
                    await connection.execute('INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)', [id, size, qty]);
                }
            } else {
                await connection.execute('INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)', [id, 'Geral', data.stock || 0]);
            }

            // Atualizar imagens
            if (data.images && data.images.length > 0) {
                await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
                for (let i = 0; i < data.images.slice(0, 5).length; i++) {
                    const img = data.images[i];
                    let urlToSave = img.startsWith('data:image') ? await uploadService.uploadImage(img) : img;
                    await connection.execute('INSERT INTO product_images (image_url, is_main, product_id) VALUES (?, ?, ?)', [urlToSave, i === 0 ? 1 : 0, id]);
                }
            }

            await connection.commit();
            res.json({ message: 'Produto atualizado com sucesso!' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Erro no update:", error);
            res.status(500).json({ error: 'Erro ao atualizar.' });
        } finally {
            if (connection) connection.release();
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            // Deletar em cascata manual para garantir integridade
            await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
            await db.execute('DELETE FROM product_inventory WHERE product_id = ?', [id]);
            await db.execute('DELETE FROM products WHERE id = ?', [id]);
            res.json({ message: 'Produto removido com sucesso!' });
        } catch (error) {
            console.error("Erro no delete:", error);
            res.status(500).json({ error: 'Erro ao deletar.' });
        }
    }
};

module.exports = productController;