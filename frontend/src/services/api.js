import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api' 
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- SERVIÇO DE AUTENTICAÇÃO ---
export const authSvc = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    validate: () => api.get('/auth/validate')
};

// --- SERVIÇO DE CATEGORIAS ---
export const categorySvc = {
    list: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`)
};

// --- SERVIÇO DE LOGS DE ATIVIDADE ---
export const activityLogSvc = {
    list: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/activity-logs?${queryString}`);
    }
};

// --- SERVIÇO DA LOJA (Cliente) ---
export const storeSvc = {
    list: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return api.get(`/store/products?${queryString}`);
    },
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