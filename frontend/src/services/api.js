import axios from 'axios';

// Cria a conexão com o backend
const api = axios.create({
    baseURL: 'http://localhost:3000/api' 
});

// --- SERVIÇO DA LOJA (Cliente) ---
export const storeSvc = {
    // Busca produtos para a Home com filtros
    list: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        // Nota: agora aponta para /store/products
        return api.get(`/store/products?${queryString}`);
    },

    // Busca opções para a Sidebar
    getFilters: () => api.get('/store/filters')
};

// --- SERVIÇO DO ADMIN (Dashboard) ---
export const productSvc = {
    list: () => api.get('/products'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

export default api;