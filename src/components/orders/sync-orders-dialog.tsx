'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { shopeeAPI } from '@/lib/api';
import { toast } from 'sonner';

interface SyncOrdersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSync: (data: any) => Promise<void>;
}

export function SyncOrdersDialog({ open, onOpenChange, onSync }: SyncOrdersDialogProps) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopeeAccountId: '',
        orderStatus: 'all',
        timeRangeField: 'create_time',
        timeFrom: '',
        timeTo: '',
        pageSize: 50,
    });

    useEffect(() => {
        if (open) {
            loadAccounts();
            // Set default date range (last 30 days)
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            setFormData(prev => ({
                ...prev,
                timeFrom: Math.floor(thirtyDaysAgo.getTime() / 1000).toString(),
                timeTo: Math.floor(now.getTime() / 1000).toString(),
            }));
        }
    }, [open]);

    const loadAccounts = async () => {
        try {
            const response = await shopeeAPI.getAccounts();
            setAccounts(response.data.accounts);
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast.error('Gagal memuat akun');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.shopeeAccountId) {
            toast.error('Silakan pilih akun Shopee');
            return;
        }

        setLoading(true);
        try {
            const syncData = {
                ...formData,
                orderStatus: formData.orderStatus === 'all' ? '' : formData.orderStatus,
                timeFrom: formData.timeFrom ? parseInt(formData.timeFrom) : undefined,
                timeTo: formData.timeTo ? parseInt(formData.timeTo) : undefined,
                pageSize: parseInt(formData.pageSize.toString()),
            };

            await onSync(syncData);
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (field: 'timeFrom' | 'timeTo', value: string) => {
        if (value) {
            const timestamp = Math.floor(new Date(value).getTime() / 1000);
            setFormData(prev => ({
                ...prev,
                [field]: timestamp.toString(),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const getDateValue = (timestamp: string) => {
        if (!timestamp) return '';
        return new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
    };

    const orderStatuses = [
        { value: 'all', label: 'Semua status' },
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Sinkronkan Pesanan dari Shopee</DialogTitle>
                    <DialogDescription>
                        Sinkronkan pesanan dari akun Shopee Anda. Ini akan mengambil pesanan berdasarkan kriteria yang Anda tentukan.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="account">Akun Shopee *</Label>
                        <Select
                            value={formData.shopeeAccountId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, shopeeAccountId: value }))}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih akun" />
                            </SelectTrigger>
                            <SelectContent>
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
                            value={formData.orderStatus}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, orderStatus: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                {orderStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Tanggal Mulai</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={getDateValue(formData.timeFrom)}
                                onChange={(e) => handleDateChange('timeFrom', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Tanggal Akhir</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={getDateValue(formData.timeTo)}
                                onChange={(e) => handleDateChange('timeTo', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pageSize">Ukuran Halaman</Label>
                        <Select
                            value={formData.pageSize.toString()}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, pageSize: parseInt(value) }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20">20 pesanan</SelectItem>
                                <SelectItem value="50">50 pesanan</SelectItem>
                                <SelectItem value="100">100 pesanan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sinkronkan Pesanan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}