'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { shopeeAPI } from '@/lib/api';

interface OrdersFiltersProps {
    filters: {
        shopeeAccountId: string;
        orderStatus: string;
        search: string;
        startDate: string;
        endDate: string;
    };
    onFiltersChange: (filters: any) => void;
}

export function OrdersFilters({ filters, onFiltersChange }: OrdersFiltersProps) {
    const [accounts, setAccounts] = useState([]);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const response = await shopeeAPI.getAccounts();
            setAccounts(response.data.accounts);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFiltersChange(localFilters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            shopeeAccountId: 'all',
            orderStatus: 'all',
            search: '',
            startDate: '',
            endDate: '',
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const orderStatuses = [
        { value: 'UNPAID', label: 'Belum dibayar' },
        { value: 'READY_TO_SHIP', label: 'Siap dikirim' },
        { value: 'PROCESSED', label: 'Diproses' },
        { value: 'SHIPPED', label: 'Dikirim' },
        { value: 'COMPLETED', label: 'Selesai' },
        { value: 'IN_CANCEL', label: 'Dalam pembatalan' },
        { value: 'CANCELLED', label: 'Dibatalkan' },
        { value: 'INVOICE_PENDING', label: 'Menunggu invoice' },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
                <Label htmlFor="account">Akun Shopee</Label>
                <Select
                    value={localFilters.shopeeAccountId}
                    onValueChange={(value) => handleFilterChange('shopeeAccountId', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Semua akun" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua akun</SelectItem>
                        {accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.shopName || account.shopId}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status Pesanan</Label>
                <Select
                    value={localFilters.orderStatus}
                    onValueChange={(value) => handleFilterChange('orderStatus', value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua status</SelectItem>
                        {orderStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="search">Cari No. Pesanan</Label>
                <Input
                    id="search"
                    placeholder="Cari berdasarkan nomor pesanan..."
                    value={localFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                    id="startDate"
                    type="date"
                    value={localFilters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input
                    id="endDate"
                    type="date"
                    value={localFilters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
            </div>

            <div className="flex items-end space-x-2">
                <Button onClick={applyFilters} className="flex-1">
                    Terapkan Filter
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                    Hapus
                </Button>
            </div>
        </div>
    );
}