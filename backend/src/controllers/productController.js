const uploadService = require('../services/uploadService');
const db = require('../config/database');
const { logActivity } = require('../utils/activityLogger');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const productController = {
    getAll: asyncHandler(async (req, res) => {
        const query = `
            SELECT p.*, 
            pc.name as category_name,
            pc.has_sizes as category_has_sizes,
            GROUP_CONCAT(DISTINCT CONCAT(i.id, '|', i.image_url, '|', COALESCE(i.public_id, ''), '|', i.is_main) ORDER BY i.is_main DESC, i.id ASC) as all_images,
            GROUP_CONCAT(DISTINCT CONCAT(inv.size, ':', inv.quantity)) as stock_data
            FROM products p 
            LEFT JOIN product_categories pc ON p.category_id = pc.id
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

            let imagesArray = [];
            if (prod.all_images) {
                imagesArray = prod.all_images.split(',').map(imgData => {
                    const [id, url, public_id, is_main] = imgData.split('|');
                    return {
                        id: parseInt(id),
                        url,
                        public_id: public_id || null,
                        is_main: parseInt(is_main) === 1
                    };
                });
            }

            return {
                ...prod,
                category: prod.category_name || 'Sem categoria',
                price: prod.sale_price,
                sale_price: prod.sale_price,
                has_discount: prod.has_discount,
                discount_percentage: prod.discount_percentage,
                images: imagesArray.map(img => img.url),
                imageDetails: imagesArray,
                stock: (prod.category_has_sizes === 1) ? stockObj : (Object.values(stockObj)[0] || 0)
            };
        });

        res.json(products);
    }),

    create: asyncHandler(async (req, res) => {
        const connection = await db.getConnection(); 
        
        try {
            await connection.beginTransaction();
            const data = req.body;

            if (!data.name || !data.category_id) {
                throw new AppError('Nome e categoria são obrigatórios', 400);
            }

            const queryProd = `
                INSERT INTO products 
                (name, description, category_id, team, type, gender, cost_price, sale_price, has_discount, discount_percentage) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(queryProd, [
                data.name,
                data.description || '',
                data.category_id,
                data.team || '',
                data.type || data.origin || '', 
                data.gender || '',
                data.costPrice || 0,
                data.salePrice || 0,
                data.hasDiscount ? 1 : 0,
                data.discountPercentage || 0
            ]);

            const newProductId = result.insertId;

            // Buscar informações da categoria
            const [categoryInfo] = await connection.execute(
                'SELECT has_sizes FROM product_categories WHERE id = ?',
                [data.category_id]
            );

            const usesSizes = categoryInfo.length > 0 && categoryInfo[0].has_sizes === 1;

            // Inserir Estoque
            if (usesSizes && typeof data.stock === 'object') {
                for (const [size, qty] of Object.entries(data.stock)) {
                    await connection.execute(
                        'INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)',
                        [newProductId, size, qty]
                    );
                }
            } else {
                await connection.execute(
                    'INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)',
                    [newProductId, 'Geral', data.stock || 0]
                );
            }

            // Salvar Imagens
            if (data.images && data.images.length > 0) {
                const imagesToProcess = data.images.slice(0, 5);
                for (let i = 0; i < imagesToProcess.length; i++) {
                    const img = imagesToProcess[i];
                    let urlToSave, publicId = null;
                    
                    if (img.startsWith('data:image')) {
                        const uploadResult = await uploadService.uploadImage(img);
                        urlToSave = uploadResult.url;
                        publicId = uploadResult.public_id;
                    } else {
                        urlToSave = img;
                    }

                    await connection.execute(
                        'INSERT INTO product_images (image_url, public_id, is_main, product_id) VALUES (?, ?, ?, ?)',
                        [urlToSave, publicId, i === 0 ? 1 : 0, newProductId]
                    );
                }
            }

            if (req.user) {
                await logActivity(
                    req.user.id,
                    'Criou produto',
                    'products',
                    newProductId,
                    { name: data.name, category_id: data.category_id }
                );
            }

            await connection.commit();
            res.status(201).json({ message: 'Produto cadastrado com sucesso!', id: newProductId });
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }),

    update: asyncHandler(async (req, res) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            const { id } = req.params;
            const data = req.body;

            if (!data.name || !data.category_id) {
                throw new AppError('Nome e categoria são obrigatórios', 400);
            }

            const [oldProduct] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
            
            if (oldProduct.length === 0) {
                throw new AppError('Produto não encontrado', 404);
            }

            const queryUpdate = `
                UPDATE products SET 
                name=?, description=?, category_id=?, team=?, type=?, gender=?, 
                cost_price=?, sale_price=?, has_discount=?, discount_percentage=?
                WHERE id=?
            `;

            await connection.execute(queryUpdate, [
                data.name, data.description || '', data.category_id, data.team || '', 
                data.type || data.origin || '', data.gender || '', 
                data.costPrice, data.salePrice, 
                data.hasDiscount ? 1 : 0, data.discountPercentage || 0, id
            ]);

            // Buscar informações da categoria
            const [categoryInfo] = await connection.execute(
                'SELECT has_sizes FROM product_categories WHERE id = ?',
                [data.category_id]
            );

            const usesSizes = categoryInfo.length > 0 && categoryInfo[0].has_sizes === 1;

            // Atualizar estoque
            await connection.execute('DELETE FROM product_inventory WHERE product_id = ?', [id]);
            if (usesSizes && typeof data.stock === 'object') {
                for (const [size, qty] of Object.entries(data.stock)) {
                    await connection.execute('INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)', [id, size, qty]);
                }
            } else {
                await connection.execute('INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)', [id, 'Geral', data.stock || 0]);
            }

            // Atualizar imagens
            if (data.images && data.images.length > 0) {
                const [oldImages] = await connection.execute('SELECT public_id FROM product_images WHERE product_id = ?', [id]);
                
                for (const oldImg of oldImages) {
                    if (oldImg.public_id) {
                        try {
                            await uploadService.deleteImage(oldImg.public_id);
                        } catch (err) {
                            console.error('Erro ao deletar imagem do Cloudinary:', err);
                        }
                    }
                }

                await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
                
                for (let i = 0; i < data.images.slice(0, 5).length; i++) {
                    const img = data.images[i];
                    let urlToSave, publicId = null;
                    
                    if (img.startsWith('data:image')) {
                        const uploadResult = await uploadService.uploadImage(img);
                        urlToSave = uploadResult.url;
                        publicId = uploadResult.public_id;
                    } else {
                        urlToSave = img;
                    }
                    
                    await connection.execute('INSERT INTO product_images (image_url, public_id, is_main, product_id) VALUES (?, ?, ?, ?)', [urlToSave, publicId, i === 0 ? 1 : 0, id]);
                }
            }

            if (req.user) {
                await logActivity(
                    req.user.id,
                    'Atualizou produto',
                    'products',
                    id,
                    { old: oldProduct[0], new: data }
                );
            }

            await connection.commit();
            res.json({ message: 'Produto atualizado com sucesso!' });
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }),

    delete: asyncHandler(async (req, res) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            const { id } = req.params;

            const [product] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
            
            if (product.length === 0) {
                throw new AppError('Produto não encontrado', 404);
            }
            
            const [images] = await connection.execute('SELECT public_id FROM product_images WHERE product_id = ?', [id]);

            for (const img of images) {
                if (img.public_id) {
                    try {
                        await uploadService.deleteImage(img.public_id);
                    } catch (err) {
                        console.error('Erro ao deletar imagem do Cloudinary:', err);
                    }
                }
            }

            await connection.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
            await connection.execute('DELETE FROM product_inventory WHERE product_id = ?', [id]);
            await connection.execute('DELETE FROM products WHERE id = ?', [id]);

            if (req.user) {
                await logActivity(
                    req.user.id,
                    'Deletou produto',
                    'products',
                    id,
                    product[0]
                );
            }

            await connection.commit();
            res.json({ message: 'Produto removido com sucesso!' });
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    })
};

module.exports = productController;
