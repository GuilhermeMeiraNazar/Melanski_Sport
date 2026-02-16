import axios from 'axios';

// Cria a conexão com o backend
const api = axios.create({
    baseURL: 'http://localhost:3000/api' // Porta definida no server.js
});

// Funções prontas para usar no Admin
export const productSvc = {
    // Busca todos os produtos
    list: () => api.get('/products'),
    
    // Envia um novo produto (JSON com imagens em Base64 incluso)
    create: (data) => api.post('/products', data),
    
    // Atualiza um produto
    update: (id, data) => api.put(`/products/${id}`, data),
    
    // Deleta um produto
    delete: (id) => api.delete(`/products/${id}`)
};

export default api;