const express = require('express');
const cors = require('cors');
const path = require('path');
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
const appearanceRoutes = require('./routes/appearanceRoutes');
const developerSettingsRoutes = require('./routes/developerSettingsRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');
const credentialsRoutes = require('./routes/credentials');

// Importação do middleware de erro
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());

// Aumentamos o limite para 50mb para aceitar envio de imagens em Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir arquivos estáticos do frontend (build do Vite)
app.use(express.static(path.join(__dirname, '../../public_html')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/appearance', appearanceRoutes);
app.use('/api/developer-settings', developerSettingsRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/credentials', credentialsRoutes);

// Rota curinga para servir o index.html do React (deve vir DEPOIS das rotas de API)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../../public_html', 'index.html'));
    }
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Porta do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Endpoints da loja ativos em: http://localhost:${PORT}/api/store`);
});