'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersFilters } from '@/components/orders/orders-filters';
import { OrdersStats } from '@/components/orders/orders-stats';
import { SyncOrdersDialog } from '@/components/orders/sync-orders-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Order {
    id: string;
    orderSn: string;
    orderStatus: string;
    totalAmount: number | null;
    currency: string | null;
    createTime: string;
    updateTime: string | null;
    shopeeAccount: {
        id: string;
        shopId: string;
        shopName: string | null;
    };
    escrowData: any[];
}

interface OrdersResponse {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface OrderStats {
    totalOrders: number;
    ordersByStatus: { status: string; count: number }[];
    recentOrders: number;
    totalAmount: number;
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [loading, setLoading] = useState(true);
    // Set default date to today (local timezone)
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format: YYYY-MM-DD in local timezone
    };

    const [filters, setFilters] = useState({
        shopeeAccountId: 'all',
        orderStatus: 'all',
        search: '',
        startDate: '', // Default to empty (show all)
        endDate: '',   // Default to empty (show all)
    });
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    const loadOrders = useCallback(async (page = 1) => {
        if (status === 'loading' || !session) return;

        try {
            setLoading(true);
            // Convert "all" values to empty strings for API
            const apiFilters = {
                ...filters,
                shopeeAccountId: filters.shopeeAccountId === 'all' ? '' : filters.shopeeAccountId,
                orderStatus: filters.orderStatus === 'all' ? '' : filters.orderStatus,
            };
            const response = await ordersAPI.getOrders({
                ...apiFilters,
                page,
                limit: 10,
            });
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Sesi berakhir. Silakan masuk kembali.');
                router.push('/auth/login?session=expired');
            } else {
                toast.error('Gagal memuat pesanan: ' + (error.response?.data?.message || error.message));
            }
            console.error('Error loading orders:', error);
            // Set empty state when there's an error
            setOrders([]);
            setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
        } finally {
            setLoading(false);
        }
    }, [filters, session, status, router]);

    const loadStats = useCallback(async () => {
        if (status === 'loading' || !session) return;

        try {
            const response = await ordersAPI.getStats();
            setStats(response.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('Authentication required for stats');
                setStats(null);
            } else {
                console.error('Error loading stats:', error);
                toast.error('Gagal memuat statistik');
                setStats(null);
            }
        }
    }, [session, status]);

    useEffect(() => {
        if (status === 'loading') return;
        
        if (!session) {
            router.push('/auth/login');
            return;
        }
        
        loadOrders();
        loadStats();
    }, [session, status, router, filters, loadOrders, loadStats]);

    const handleSync = async (syncData: any) => {
        try {
            const response = await ordersAPI.syncOrders(syncData);
            toast.success(`Berhasil menyinkronkan ${response.data.totalOrders} pesanan`);
            loadOrders();
            loadStats();
            setSyncDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyinkronkan pesanan');
        }
    };

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleRefresh = () => {
        loadOrders();
        loadStats();
    };

    const handleExport = async () => {
        // TODO: Implement export functionality
        toast.info('Fitur ekspor akan segera hadir');
    };

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Redirect if not authenticated
    if (!session) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Pesanan</h1>
                        <p className="text-muted-foreground">
                            Kelola dan sinkronkan pesanan Shopee Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Perbarui
                        </Button>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Ekspor
                        </Button>
                        <Button onClick={() => setSyncDialogOpen(true)}>
                            Sinkron Pesanan
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                {stats && <OrdersStats stats={stats} />}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OrdersFilters
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                        />
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pesanan ({pagination.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <OrdersTable
                            orders={orders}
                            pagination={pagination}
                            loading={loading}
                            onPageChange={loadOrders}
                        />
                    </CardContent>
                </Card>

                {/* Sync Dialog */}
                <SyncOrdersDialog
                    open={syncDialogOpen}
                    onOpenChange={setSyncDialogOpen}
                    onSync={handleSync}
                />
            </div>
        </DashboardLayout>
    );
}