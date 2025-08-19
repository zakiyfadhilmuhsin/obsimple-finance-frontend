'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, DollarSign, Package } from 'lucide-react';

interface OrderStats {
    totalOrders: number;
    ordersByStatus: { status: string; count: number }[];
    recentOrders: number;
    totalAmount: number;
}

interface OrdersStatsProps {
    stats: OrderStats;
}

export function OrdersStats({ stats }: OrdersStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'SHIPPED':
                return 'bg-blue-100 text-blue-800';
            case 'READY_TO_SHIP':
                return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        All time orders
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.recentOrders.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Last 7 days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                    <p className="text-xs text-muted-foreground">
                        From all orders
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Order Status</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.ordersByStatus.slice(0, 3).map((item) => (
                            <div key={item.status} className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(item.status)}`}>
                                    {item.status.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm font-medium">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}