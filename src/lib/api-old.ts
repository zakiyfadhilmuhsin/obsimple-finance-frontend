import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3016';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors - LESS AGGRESSIVE AUTO-LOGOUT
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't auto-logout immediately - let components handle it
            console.warn('Authentication required:', error.response?.data?.message || 'Token expired');
            
            // Only auto-logout for specific critical endpoints or repeated failures
            const endpoint = error.config?.url || '';
            const isAuthEndpoint = endpoint.includes('/auth/');
            const currentPath = window.location.pathname;
            
            // Auto-logout conditions (more restrictive):
            // 1. Auth-related endpoints fail
            // 2. User is on login page and still getting 401
            if (isAuthEndpoint || currentPath.startsWith('/auth/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!currentPath.startsWith('/auth/')) {
                    window.location.href = '/auth/login?session=expired';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (email: string, password: string, name?: string) =>
        api.post('/auth/register', { email, password, name }),

    refresh: () => api.post('/auth/refresh'),
    
    getProfile: () => api.get('/auth/me'),
};

// Shopee API
export const shopeeAPI = {
    getAuthUrl: () => api.get('/shopee/auth'),
    getAccounts: () => api.get('/shopee/accounts'),
    refreshAccount: (accountId: string) => api.post(`/shopee/accounts/${accountId}/refresh`),
    deleteAccount: (accountId: string) => api.delete(`/shopee/accounts/${accountId}`),
};

// Orders API
export const ordersAPI = {
    getOrders: (params?: any) =>
        api.get('/orders', { params }),
    syncOrders: (data: any) =>
        api.post('/orders/sync', data),
    getStats: () =>
        api.get('/orders/stats'),
    getOrderById: (id: string) =>
        api.get(`/orders/${id}`),
    deleteOrder: (id: string) =>
        api.delete(`/orders/${id}`),
};

// Finance API
export const financeAPI = {
    getOverview: () => api.get('/finance/overview'),
    getEscrowData: (params?: any) => api.get('/finance/escrow', { params }),
};