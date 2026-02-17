const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das rotas
const productRoutes = require('./routes/productRoutes');
const storeRoutes = require('./routes/storeRoutes'); // Nova rota adicionada aqui

const app = express();

// Middlewares
app.use(cors());

// Aumentamos o limite para 50mb para aceitar envio de imagens em Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas
// Rota de administração (CRUD de produtos)
app.use('/api/products', productRoutes);

// Rota da Loja (Filtros dinâmicos, Home, Lançamentos e Ofertas)
app.use('/api/store', storeRoutes);

// Porta do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 Endpoints da loja ativos em: http://localhost:${PORT}/api/store`);
});