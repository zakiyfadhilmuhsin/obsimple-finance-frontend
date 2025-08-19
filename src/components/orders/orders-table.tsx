'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ordersAPI } from '@/lib/api';
import { format } from 'date-fns';

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

interface OrdersTableProps {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    loading: boolean;
    onPageChange: (page: number) => void;
}

export function OrdersTable({ orders, pagination, loading, onPageChange }: OrdersTableProps) {
    const formatCurrency = (amount: number | null, currency: string | null = 'IDR') => {
        if (amount === null || amount === undefined) return '-';
        
        // Handle zero amount
        if (amount === 0) {
            const symbol = currency === 'IDR' ? '₫' : (currency || '$');
            return `${symbol}0`;
        }
        
        try {
            // Use the actual currency from the order, fallback to IDR
            const currencyCode = currency || 'IDR';
            const locale = currencyCode === 'IDR' ? 'id-ID' : 'en-US';
            
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch (error) {
            // Fallback formatting if Intl fails
            const symbol = currency === 'IDR' ? '₫' : (currency || '$');
            return `${symbol}${amount.toLocaleString()}`;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'default';
            case 'SHIPPED':
                return 'secondary';
            case 'READY_TO_SHIP':
                return 'outline';
            case 'CANCELLED':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
            return;
        }

        try {
            await ordersAPI.deleteOrder(orderId);
            toast.success('Pesanan berhasil dihapus');
            // Refresh the page
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus pesanan');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Tidak ada pesanan ditemukan</p>
                <p className="text-sm text-muted-foreground">
                    Coba sesuaikan filter Anda atau sinkronkan pesanan dari Shopee
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>No. Pesanan</TableHead>
                        <TableHead>Akun</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Dibuat</TableHead>
                        <TableHead>Diperbarui</TableHead>
                        <TableHead>Escrow</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">
                                {order.orderSn}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {order.shopeeAccount.shopName || order.shopeeAccount.shopId}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ID: {order.shopeeAccount.shopId}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                                    {order.orderStatus.replace(/_/g, ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {formatCurrency(order.totalAmount, order.currency)}
                            </TableCell>
                            <TableCell>
                                {format(new Date(order.createTime), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                                {order.updateTime
                                    ? format(new Date(order.updateTime), 'MMM dd, yyyy HH:mm')
                                    : '-'
                                }
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {order.escrowData.length} rekaman
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            // TODO: Navigate to order detail page
                                            toast.info('Tampilan detail pesanan akan segera hadir');
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteOrder(order.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => pagination.page > 1 && onPageChange(pagination.page - 1)}
                                className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => onPageChange(page)}
                                        isActive={page === pagination.page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => pagination.page < pagination.totalPages && onPageChange(pagination.page + 1)}
                                className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}