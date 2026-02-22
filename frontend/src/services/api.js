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

// Interceptor para tratamento centralizado de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Tratamento de erros de autenticação
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        
        // Tratamento de erros de permissão
        if (error.response?.status === 403) {
            console.error('Acesso negado:', error.response.data);
        }
        
        // Tratamento de erros de servidor
        if (error.response?.status >= 500) {
            console.error('Erro no servidor:', error.response.data);
        }
        
        return Promise.reject(error);
    }
);

// --- SERVIÇO DE AUTENTICAÇÃO ---
export const authSvc = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    validate: () => api.get('/auth/validate'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data)
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