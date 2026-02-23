const db = require('../config/database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const XLSX = require('xlsx');

const exportController = {
    // Exportar estoque de produtos
    exportInventory: asyncHandler(async (req, res) => {
        console.log('📦 Exportando estoque...');

        // Query para buscar produtos com estoque
        const query = `
            SELECT 
                p.id,
                p.name as produto,
                pc.name as categoria,
                p.team as time_marca,
                p.type as tipo,
                p.gender as genero,
                p.cost_price as preco_custo,
                p.sale_price as preco_venda,
                p.has_discount,
                p.discount_percentage as desconto_percentual,
                CASE 
                    WHEN p.has_discount = 1 THEN ROUND(p.sale_price * (1 - p.discount_percentage / 100), 2)
                    ELSE p.sale_price
                END as preco_final,
                pc.has_sizes
            FROM products p
            INNER JOIN product_categories pc ON p.category_id = pc.id
            ORDER BY pc.name, p.name
        `;

        const [products] = await db.execute(query);

        // Buscar estoque por tamanho
        const inventoryQuery = `
            SELECT product_id, size, quantity
            FROM product_inventory
            ORDER BY product_id, 
                CASE size
                    WHEN 'P' THEN 1
                    WHEN 'M' THEN 2
                    WHEN 'G' THEN 3
                    WHEN 'GG' THEN 4
                    WHEN 'XG' THEN 5
                    ELSE 6
                END
        `;

        const [inventory] = await db.execute(inventoryQuery);

        // Organizar estoque por produto
        const inventoryByProduct = {};
        inventory.forEach(item => {
            if (!inventoryByProduct[item.product_id]) {
                inventoryByProduct[item.product_id] = {};
            }
            inventoryByProduct[item.product_id][item.size] = item.quantity;
        });

        // Preparar dados para exportação
        const data = products.map(product => {
            const row = {
                'ID': product.id,
                'Produto': product.produto,
                'Categoria': product.categoria,
                'Time/Marca': product.time_marca || '-',
                'Tipo': product.tipo || '-',
                'Gênero': product.genero || '-',
                'Preço Custo': parseFloat(product.preco_custo).toFixed(2),
                'Preço Venda': parseFloat(product.preco_venda).toFixed(2),
                'Tem Desconto': product.has_discount ? 'Sim' : 'Não',
                'Desconto %': product.desconto_percentual || 0,
                'Preço Final': parseFloat(product.preco_final).toFixed(2)
            };

            // Se tem tamanhos, adicionar colunas de estoque
            if (product.has_sizes === 1) {
                const sizes = ['P', 'M', 'G', 'GG', 'XG'];
                const productInventory = inventoryByProduct[product.id] || {};
                
                sizes.forEach(size => {
                    row[`Estoque ${size}`] = productInventory[size] || 0;
                });

                // Total de estoque
                row['Total Estoque'] = sizes.reduce((sum, size) => {
                    return sum + (productInventory[size] || 0);
                }, 0);
            } else {
                row['Estoque'] = 'N/A (sem tamanhos)';
            }

            return row;
        });

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Ajustar largura das colunas
        const colWidths = [
            { wch: 5 },  // ID
            { wch: 30 }, // Produto
            { wch: 15 }, // Categoria
            { wch: 20 }, // Time/Marca
            { wch: 12 }, // Tipo
            { wch: 12 }, // Gênero
            { wch: 12 }, // Preço Custo
            { wch: 12 }, // Preço Venda
            { wch: 12 }, // Tem Desconto
            { wch: 10 }, // Desconto %
            { wch: 12 }, // Preço Final
            { wch: 10 }, // Estoque P
            { wch: 10 }, // Estoque M
            { wch: 10 }, // Estoque G
            { wch: 10 }, // Estoque GG
            { wch: 10 }, // Estoque XG
            { wch: 12 }  // Total Estoque
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Estoque');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=estoque_${Date.now()}.xlsx`);
        res.send(buffer);

        console.log('✅ Estoque exportado com sucesso');
    }),

    // Exportar clientes cadastrados
    exportCustomers: asyncHandler(async (req, res) => {
        console.log('👥 Exportando clientes...');

        const query = `
            SELECT 
                id,
                full_name as nome_completo,
                email,
                role as cargo,
                email_verified as email_verificado,
                created_at as data_cadastro
            FROM users
            WHERE role = 'client'
            ORDER BY full_name
        `;

        const [customers] = await db.execute(query);

        // Preparar dados
        const data = customers.map(customer => ({
            'ID': customer.id,
            'Nome Completo': customer.nome_completo,
            'Email': customer.email,
            'Email Verificado': customer.email_verificado ? 'Sim' : 'Não',
            'Data Cadastro': new Date(customer.data_cadastro).toLocaleString('pt-BR')
        }));

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 5 },  // ID
            { wch: 30 }, // Nome
            { wch: 35 }, // Email
            { wch: 15 }, // Email Verificado
            { wch: 20 }  // Data Cadastro
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=clientes_${Date.now()}.xlsx`);
        res.send(buffer);

        console.log('✅ Clientes exportados com sucesso');
    }),

    // Exportar categorias
    exportCategories: asyncHandler(async (req, res) => {
        console.log('📁 Exportando categorias...');

        const query = `
            SELECT 
                pc.id,
                pc.name as nome,
                pc.slug,
                pc.has_sizes as tem_tamanhos,
                COUNT(p.id) as total_produtos,
                pc.created_at as data_criacao
            FROM product_categories pc
            LEFT JOIN products p ON pc.id = p.category_id
            GROUP BY pc.id, pc.name, pc.slug, pc.has_sizes, pc.created_at
            ORDER BY pc.name
        `;

        const [categories] = await db.execute(query);

        // Preparar dados
        const data = categories.map(category => ({
            'ID': category.id,
            'Nome': category.nome,
            'Slug': category.slug,
            'Tem Tamanhos': category.tem_tamanhos ? 'Sim' : 'Não',
            'Total de Produtos': category.total_produtos,
            'Data Criação': new Date(category.data_criacao).toLocaleString('pt-BR')
        }));

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 5 },  // ID
            { wch: 20 }, // Nome
            { wch: 20 }, // Slug
            { wch: 15 }, // Tem Tamanhos
            { wch: 18 }, // Total Produtos
            { wch: 20 }  // Data Criação
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Categorias');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=categorias_${Date.now()}.xlsx`);
        res.send(buffer);

        console.log('✅ Categorias exportadas com sucesso');
    }),

    // Exportar logs de atividade
    exportActivityLogs: asyncHandler(async (req, res) => {
        console.log('📋 Exportando logs...');

        const query = `
            SELECT 
                al.id,
                al.action as acao,
                al.target_table as tabela,
                al.target_id as id_registro,
                u.full_name as usuario,
                u.role as cargo_usuario,
                al.created_at as data_hora
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
        `;

        const [logs] = await db.execute(query);

        // Preparar dados
        const data = logs.map(log => ({
            'ID': log.id,
            'Ação': log.acao,
            'Tabela': log.tabela,
            'ID do Registro': log.id_registro,
            'Usuário': log.usuario || 'Sistema',
            'Cargo': log.cargo_usuario || '-',
            'Data e Hora': new Date(log.data_hora).toLocaleString('pt-BR')
        }));

        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 5 },  // ID
            { wch: 30 }, // Ação
            { wch: 15 }, // Tabela
            { wch: 12 }, // ID Registro
            { wch: 25 }, // Usuário
            { wch: 15 }, // Cargo
            { wch: 20 }  // Data e Hora
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Logs de Atividade');

        // Gerar buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.xlsx`);
        res.send(buffer);

        console.log('✅ Logs exportados com sucesso');
    })
};

module.exports = exportController;
