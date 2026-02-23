const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const productRoutes = require('./routes/productRoutes');
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const exportRoutes = require('./routes/exportRoutes');

// Importação do middleware de erro
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());

// Aumentamos o limite para 50mb para aceitar envio de imagens em Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/export', exportRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Porta do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Endpoints da loja ativos em: http://localhost:${PORT}/api/store`);
});