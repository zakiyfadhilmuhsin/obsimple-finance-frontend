import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3016';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests using NextAuth session
api.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
});

// Handle auth errors - no auto-logout, let NextAuth handle it
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Authentication required:', error.response?.data?.message || 'Token expired');
            // Let NextAuth handle the session expiration
            // Components can check session status using useSession
        }
        return Promise.reject(error);
    }
);

// Auth API (for custom registration)
export const authAPI = {
    register: (email: string, password: string, name?: string) =>
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
        }),
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

// Order Items API (HPP Management)
export const orderItemsAPI = {
    getSkuList: () => api.get('/order-items/skus'),
    bulkUpdateHpp: (data: { items: { sku: string; hpp: number; itemName?: string }[]; notes?: string }) =>
        api.post('/order-items/hpp/bulk-update', data),
    getHppReport: (params?: { sku?: string; startDate?: string; endDate?: string }) =>
        api.get('/order-items/hpp/report', { params }),
    getPnLItems: (orderStatus?: string) =>
        api.get('/order-items/pnl', { params: { orderStatus } }),
};

// Reports API
export const reportsAPI = {
    getProductReport: (params?: { 
        sku?: string; 
        startDate?: string; 
        endDate?: string; 
        orderStatus?: string 
    }) => api.get('/reports/products', { params }),
    getPnLReport: (params?: {
        orderStatus?: 'COMPLETED' | 'PENDING' | 'all';
        startDate?: string;
        endDate?: string;
        groupBy?: 'order' | 'daily' | 'monthly';
    }) => api.get('/reports/pnl', { params }),
    getOrderCostReport: (orderSn: string) =>
        api.get(`/reports/order/${orderSn}/costs`),
};

// Finance API
export const financeAPI = {
    getOverview: () => api.get('/finance/overview'),
    getEscrowData: (params?: any) => api.get('/finance/escrow', { params }),
    processCompletedOrders: () => api.post('/finance/escrow/process-completed'),
    triggerScheduler: () => api.post('/finance/escrow/trigger-scheduler'),
    getSchedulerStatus: () => api.get('/finance/scheduler/status'),
    fetchEscrowList: (data: any) => api.post('/finance/escrow/fetch-list', data),
    fetchEscrowDetailBatch: (data: any) => api.post('/finance/escrow/fetch-detail-batch', data),
};