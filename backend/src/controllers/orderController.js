const db = require('../config/database');
const { logActivity } = require('../utils/activityLogger');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

/**
 * Gera número único de pedido
 * Formato: ORD-YYYYMMDD-XXXX
 */
const generateOrderNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Buscar último pedido do dia
  const [rows] = await db.execute(
    'SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY order_number DESC LIMIT 1',
    [`ORD-${dateStr}-%`]
  );
  
  let sequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].order_number;
    const lastSequence = parseInt(lastNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Atualizar estoque (adicionar ou remover)
 */
const updateInventory = async (connection, productId, size, quantity, operation) => {
  if (operation === 'remove') {
    // Remover do estoque
    await connection.execute(
      'UPDATE product_inventory SET quantity = quantity - ? WHERE product_id = ? AND size = ?',
      [quantity, productId, size || 'Geral']
    );
  } else if (operation === 'add') {
    // Devolver ao estoque
    await connection.execute(
      'UPDATE product_inventory SET quantity = quantity + ? WHERE product_id = ? AND size = ?',
      [quantity, productId, size || 'Geral']
    );
  }
};

const orderController = {
  /**
   * Listar todos os pedidos
   * GET /api/orders
   */
  getAll: asyncHandler(async (req, res) => {
    try {
      console.log('📦 Buscando pedidos...');
      const { status, limit = 50, offset = 0 } = req.query;
      
      // Verificar se a tabela existe
      console.log('🔍 Verificando se tabela orders existe...');
      const [tables] = await db.execute("SHOW TABLES LIKE 'orders'");
      console.log('✅ Tabelas encontradas:', tables);
      
      if (tables.length === 0) {
        console.log('⚠️ Tabela orders não existe, retornando array vazio');
        return res.json([]);
      }
      
      // Query simplificada - sem JOIN com users por enquanto
      let query = `
        SELECT o.*
        FROM orders o
      `;
      
      const params = [];
      
      if (status) {
        query += ' WHERE o.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY o.created_at DESC';
      
      console.log('🔍 Executando query:', query);
      console.log('📊 Parâmetros:', params);
      
      const [orders] = await db.execute(query, params);
      console.log(`✅ ${orders.length} pedidos encontrados`);
      
      // Buscar itens de cada pedido
      for (const order of orders) {
        const [items] = await db.execute(
          'SELECT * FROM order_items WHERE order_id = ?',
          [order.id]
        );
        order.items = items;
        order.total_items = items.length;
        
        // Buscar nome do usuário se existir
        if (order.user_id) {
          try {
            const [users] = await db.execute(
              'SELECT full_name, email FROM users WHERE id = ?',
              [order.user_id]
            );
            if (users.length > 0) {
              order.customer_user_name = users[0].full_name || users[0].email || null;
            }
          } catch (err) {
            console.log('⚠️ Erro ao buscar usuário:', err.message);
          }
        }
        
        // Buscar nome de quem atualizou
        if (order.updated_by) {
          try {
            const [updaters] = await db.execute(
              'SELECT full_name, email FROM users WHERE id = ?',
              [order.updated_by]
            );
            if (updaters.length > 0) {
              order.updated_by_name = updaters[0].full_name || updaters[0].email || null;
            }
          } catch (err) {
            console.log('⚠️ Erro ao buscar atualizador:', err.message);
          }
        }
      }
      
      console.log('✅ Retornando pedidos com itens');
      res.json(orders);
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }),

  /**
   * Buscar pedido específico
   * GET /api/orders/:id
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const [orders] = await db.execute(
      `SELECT 
        o.*,
        u.name as customer_user_name,
        u.email as customer_user_email,
        updater.name as updated_by_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users updater ON o.updated_by = updater.id
      WHERE o.id = ?`,
      [id]
    );
    
    if (orders.length === 0) {
      throw new AppError('Pedido não encontrado', 404);
    }
    
    const order = orders[0];
    
    // Buscar itens do pedido
    const [items] = await db.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );
    
    order.items = items;
    
    res.json(order);
  }),

  /**
   * Criar novo pedido
   * POST /api/orders
   */
  create: asyncHandler(async (req, res) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_zip,
        notes,
        items
      } = req.body;
      
      // Gerar número do pedido
      const orderNumber = await generateOrderNumber();
      
      // Calcular total
      let totalAmount = 0;
      for (const item of items) {
        totalAmount += item.quantity * item.unit_price;
      }
      
      // Verificar estoque disponível
      for (const item of items) {
        const [inventory] = await connection.execute(
          'SELECT quantity FROM product_inventory WHERE product_id = ? AND size = ?',
          [item.product_id, item.product_size || 'Geral']
        );
        
        if (inventory.length === 0) {
          throw new AppError(`Produto ${item.product_name} não encontrado no estoque`, 400);
        }
        
        if (inventory[0].quantity < item.quantity) {
          throw new AppError(
            `Estoque insuficiente para ${item.product_name}${item.product_size ? ` (${item.product_size})` : ''}. Disponível: ${inventory[0].quantity}`,
            400
          );
        }
      }
      
      // Inserir pedido
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_state, delivery_zip,
          total_amount, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          orderNumber,
          user_id || null,
          customer_name,
          customer_email || null,
          customer_phone,
          delivery_address,
          delivery_city,
          delivery_state,
          delivery_zip,
          totalAmount,
          notes || null
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // Inserir itens e remover do estoque
      for (const item of items) {
        const subtotal = item.quantity * item.unit_price;
        
        // Inserir item
        await connection.execute(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_size, product_image,
            quantity, unit_price, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.product_name,
            item.product_size || null,
            item.product_image || null,
            item.quantity,
            item.unit_price,
            subtotal
          ]
        );
        
        // Remover do estoque
        await updateInventory(
          connection,
          item.product_id,
          item.product_size,
          item.quantity,
          'remove'
        );
      }
      
      // Log da atividade
      if (req.user) {
        await logActivity(
          req.user.id,
          'Criou pedido',
          'orders',
          orderId,
          { order_number: orderNumber, total_amount: totalAmount }
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        message: 'Pedido criado com sucesso!',
        order_id: orderId,
        order_number: orderNumber
      });
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }),

  /**
   * Atualizar status do pedido
   * PATCH /api/orders/:id/status
   */
  updateStatus: asyncHandler(async (req, res) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { id } = req.params;
      const { status } = req.body;
      
      // Buscar pedido atual
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );
      
      if (orders.length === 0) {
        throw new AppError('Pedido não encontrado', 404);
      }
      
      const order = orders[0];
      
      // Verificar se pedido já foi finalizado ou cancelado
      if (order.status !== 'pending') {
        throw new AppError(
          `Pedido já está ${order.status === 'completed' ? 'finalizado' : 'cancelado'}. Não é possível alterar o status.`,
          400
        );
      }
      
      // Buscar itens do pedido
      const [items] = await connection.execute(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );
      
      // Se cancelar, devolver itens ao estoque
      if (status === 'cancelled') {
        for (const item of items) {
          await updateInventory(
            connection,
            item.product_id,
            item.product_size,
            item.quantity,
            'add'
          );
        }
      }
      
      // Atualizar status
      await connection.execute(
        'UPDATE orders SET status = ?, updated_by = ? WHERE id = ?',
        [status, req.user.id, id]
      );
      
      // Log da atividade
      await logActivity(
        req.user.id,
        `${status === 'cancelled' ? 'Cancelou' : 'Finalizou'} pedido`,
        'orders',
        id,
        { order_number: order.order_number, old_status: order.status, new_status: status }
      );
      
      await connection.commit();
      
      res.json({
        message: `Pedido ${status === 'cancelled' ? 'cancelado' : 'finalizado'} com sucesso!`
      });
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  })
};

module.exports = orderController;
