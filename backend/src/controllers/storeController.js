const db = require('../config/database');

const storeController = {
    listProducts: async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 12, 
                search, 
                team, 
                category, 
                gender, 
                origin, 
                size, 
                is_offer, 
                is_launch 
            } = req.query;

            const intLimit = parseInt(limit) || 12;
            const offset = (parseInt(page) - 1) * intLimit;

            const params = [];
            let whereClause = 'WHERE 1=1';

            if (search) {
                whereClause += ' AND p.name LIKE ?';
                params.push(`%${search}%`);
            }
            if (team) {
                whereClause += ' AND p.team = ?';
                params.push(team);
            }
            if (category) {
                whereClause += ' AND p.category = ?';
                params.push(category);
            }
            if (gender) {
                whereClause += ' AND p.gender = ?';
                params.push(gender);
            }
            if (origin) {
                whereClause += ' AND p.type = ?';
                params.push(origin);
            }
            if (is_offer === 'true') {
                whereClause += ' AND p.has_discount = 1';
            }
            if (is_launch === 'true') {
                whereClause += ' AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
            }
            if (size) {
                whereClause += ` AND EXISTS (
                    SELECT 1 FROM product_inventory inv 
                    WHERE inv.product_id = p.id AND inv.size = ? AND inv.quantity > 0
                )`;
                params.push(size);
            }

            const query = `
                SELECT p.*, 
                GROUP_CONCAT(DISTINCT i.image_url ORDER BY i.is_main DESC, i.id ASC) as all_images,
                GROUP_CONCAT(DISTINCT CONCAT(inv.size, ':', inv.quantity)) as stock_data,
                (p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as is_new_release
                FROM products p 
                LEFT JOIN product_images i ON p.id = i.product_id 
                LEFT JOIN product_inventory inv ON p.id = inv.product_id
                ${whereClause}
                GROUP BY p.id
                ORDER BY 
                    CASE 
                        WHEN p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 
                        WHEN p.has_discount = 1 THEN 2 
                        ELSE 3 
                    END ASC,
                    p.name ASC
                LIMIT ${intLimit} OFFSET ${offset}
            `;

            const [rows] = await db.execute(query, params);

            const countQuery = `
                SELECT COUNT(DISTINCT p.id) as total 
                FROM products p 
                LEFT JOIN product_inventory inv ON p.id = inv.product_id
                ${whereClause}
            `;
            const [countResult] = await db.execute(countQuery, params);
            const totalItems = countResult[0].total;

            const products = rows.map(prod => {
                let stockObj = {};
                if (prod.stock_data) {
                    prod.stock_data.split(',').forEach(item => {
                        const parts = item.split(':');
                        if(parts.length === 2) {
                            const [sz, qty] = parts;
                            stockObj[sz] = parseInt(qty) || 0;
                        }
                    });
                }

                const imagesArray = prod.all_images ? prod.all_images.split(',') : [];

                // LOGICA DE PREÇO: sale_price é o valor base (ex: 200)
                const originalPrice = parseFloat(prod.sale_price) || 0;
                const discountPercent = parseFloat(prod.discount_percent) || 0;
                
                let finalPrice = originalPrice;
                let oldPriceValue = null;

                if (prod.has_discount === 1 && discountPercent > 0) {
                    finalPrice = originalPrice - (originalPrice * (discountPercent / 100));
                    oldPriceValue = originalPrice; // O preço original vai para o campo de riscado
                }

                return {
                    id: prod.id,
                    name: prod.name,
                    description: prod.description,
                    price: finalPrice, 
                    oldPrice: oldPriceValue,
                    images: imagesArray,
                    sizes: Object.keys(stockObj).filter(key => stockObj[key] > 0),
                    type: prod.type,
                    isOffer: prod.has_discount === 1,
                    isLaunch: !!prod.is_new_release,
                    rating: 5.0,
                    reviews: 0
                };
            });

            res.json({
                data: products,
                pagination: {
                    total: totalItems,
                    page: parseInt(page),
                    totalPages: Math.ceil(totalItems / intLimit)
                }
            });

        } catch (error) {
            console.error("Erro no storeController.listProducts:", error);
            res.status(500).json({ error: 'Erro ao buscar produtos da loja' });
        }
    },

    getSidebarOptions: async (req, res) => {
        try {
            const [teams] = await db.execute('SELECT DISTINCT team FROM products WHERE team IS NOT NULL AND team != "" ORDER BY team ASC');
            const [types] = await db.execute('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
            const [genders] = await db.execute('SELECT DISTINCT gender FROM products WHERE gender IS NOT NULL AND gender != ""');
            const [sizes] = await db.execute('SELECT DISTINCT size FROM product_inventory WHERE quantity > 0 ORDER BY size ASC');

            res.json({
                times: teams.map(t => t.team),
                tipos: types.map(t => t.category),
                generos: genders.map(g => g.gender),
                tamanhos: sizes.map(s => s.size).filter(s => s !== 'Geral' && s !== 'Único')
            });
        } catch (error) {
            console.error("Erro no storeController.getSidebarOptions:", error);
            res.status(500).json({ error: 'Erro ao carregar filtros' });
        }
    }
};

module.exports = storeController;