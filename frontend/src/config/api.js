// Configuração centralizada da API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const BASE_URL = API_URL.replace('/api', '');
