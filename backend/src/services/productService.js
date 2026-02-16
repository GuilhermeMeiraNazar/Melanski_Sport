const db = require('../config/database');

const productService = {
    // 1. QUERY PARA LISTAR (Necessário para o Admin carregar a lista)
    getAllProducts: async () => {
        // Buscamos os produtos
        const [products] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
        
        // Para cada produto, precisamos buscar o estoque para montar o objeto igual ao seu Front espera
        const productsWithDetails = await Promise.all(products.map(async (product) => {
            const [inventory] = await db.execute('SELECT size, quantity FROM product_inventory WHERE product_id = ?', [product.id]);
            
            // Transforma o array do banco [{size: 'P', quantity: 2}] no objeto do front { P: 2 }
            let stockObj = {};
            let simpleStock = 0;
            
            inventory.forEach(item => {
                stockObj[item.size] = item.quantity;
                simpleStock += item.quantity;
            });

            return {
                ...product,
                price: parseFloat(product.sale_price), // Adaptando para o nome que seu front usa
                stock: product.category === 'Roupa' ? stockObj : simpleStock
            };
        }));

        return productsWithDetails;
    },

    // 2. QUERY PARA CADASTRAR OS PRODUTOS (Sua query de INSERT complexa)
    createProduct: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // A. Inserir na tabela products
            const [result] = await connection.execute(
                `INSERT INTO products 
                (name, description, category, team, type, gender, cost_price, sale_price, has_discount, discount_percentage) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.name, 
                    data.description, 
                    data.category, 
                    data.team || null, 
                    data.type || 'Nacional', // Valor default caso venha vazio
                    data.gender || 'Unissex', 
                    data.costPrice, 
                    data.salePrice, 
                    data.hasDiscount, 
                    data.discountPercentage
                ]
            );

            const newProductId = result.insertId;

            // B. Inserir na tabela product_inventory
            // Se for roupa, data.stock é um objeto {P: 2, M: 5}. Se não, é um número.
            if (typeof data.stock === 'object') {
                for (const [size, qty] of Object.entries(data.stock)) {
                    if (qty > 0) {
                        await connection.execute(
                            `INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)`,
                            [newProductId, size, qty]
                        );
                    }
                }
            } else {
                // Para acessórios/copos (Tamanho Único)
                await connection.execute(
                    `INSERT INTO product_inventory (product_id, size, quantity) VALUES (?, ?, ?)`,
                    [newProductId, 'Único', data.stock]
                );
            }

            // C. Inserir Imagens (Se houver - assumindo que data.images é um array de URLs vindo do Cloudinary)
            if (data.images && data.images.length > 0) {
                for (let i = 0; i < data.images.length; i++) {
                    await connection.execute(
                        `INSERT INTO product_images (product_id, image_url, is_main) VALUES (?, ?, ?)`,
                        [newProductId, data.images[i], i === 0] // Primeira imagem é a principal
                    );
                }
            }

            await connection.commit();
            return { id: newProductId, ...data };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 3. QUERY PARA EDITAR UM PRODUTO (UPDATE)
    updateProduct: async (id, data) => {
        // Executa a Query de Update segura
        await db.execute(
            `UPDATE products 
            SET name = ?, description = ?, sale_price = ?, has_discount = ?, discount_percentage = ?, gender = ? 
            WHERE id = ?`,
            [data.name, data.description, data.salePrice, data.hasDiscount, data.discountPercentage, data.gender || 'Unissex', id]
        );
        
        // Nota: Atualizar estoque é complexo (update vs insert), 
        // por enquanto mantivemos a atualização apenas dos dados principais conforme sua query de exemplo.
        return { id, ...data };
    },

    // 4. QUERY PARA LIMPAR ALGO (DELETE)
    deleteProduct: async (id) => {
        // Graças ao ON DELETE CASCADE configurado no seu CREATE TABLE, 
        // deletar o produto remove automaticamente o inventário e as imagens.
        await db.execute('DELETE FROM products WHERE id = ?', [id]);
        return true;
    }
};

module.exports = productService;