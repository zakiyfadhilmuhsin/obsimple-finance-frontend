'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reportsAPI } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface PnLReportItem {
  orderSn: string;
  orderStatus: string;
  orderDate: string;
  paymentDate?: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  totalFees: number;
  itemCount: number;
  items: Array<{
    sku: string;
    itemName: string;
    quantity: number;
    revenue: number;
    cost: number;
    profit: number;
    hasHpp: boolean;
  }>;
}

interface PnLSummary {
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  totalNetProfit: number;
  totalFees: number;
  overallGrossMargin: number;
  overallNetMargin: number;
  ordersWithoutHpp: number;
  completedOrders: number;
  pendingOrders: number;
}

export default function PnLReportPage() {
  const [data, setData] = useState<PnLReportItem[]>([]);
  const [summary, setSummary] = useState<PnLSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalGrossProfit: 0,
    totalNetProfit: 0,
    totalFees: 0,
    overallGrossMargin: 0,
    overallNetMargin: 0,
    ordersWithoutHpp: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    orderStatus: 'all' as 'COMPLETED' | 'PENDING' | 'all',
    startDate: '',
    endDate: '',
    groupBy: 'order' as 'order' | 'daily' | 'monthly'
  });

  const [activeTab, setActiveTab] = useState('completed');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getPnLReport(filters);
      setData(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading P&L report:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on mount and filter change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadData();
  };

  const exportToCSV = () => {
    const csvContent = [
      ['No. Pesanan', 'Status', 'Tanggal Pesanan', 'Tanggal Pembayaran', 'Pendapatan', 'Biaya', 'Laba Kotor', 'Total Fee', 'Laba Bersih', 'Margin Kotor %', 'Margin Bersih %', 'Item'],
      ...data.map(item => [
        item.orderSn,
        item.orderStatus,
        new Date(item.orderDate).toLocaleDateString('id-ID'),
        item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('id-ID') : '',
        item.totalRevenue,
        item.totalCost,
        item.grossProfit,
        item.totalFees || 0,
        item.netProfit || 0,
        item.grossMargin.toFixed(2),
        item.netMargin ? item.netMargin.toFixed(2) : '0',
        item.itemCount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-laba-rugi.csv';
    a.click();
  };

  // Filter data by status for tabs
  const completedOrders = data.filter(item => item.orderStatus === 'COMPLETED');
  const pendingOrders = data.filter(item => item.orderStatus !== 'COMPLETED');
  const ordersWithoutHpp = data.filter(item => item.items.some(i => !i.hasHpp));

  // Prepare chart data
  const dailyTrend = data
    .reduce((acc: any[], item) => {
      const date = new Date(item.orderDate).toLocaleDateString('id-ID');
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.revenue += item.totalRevenue;
        existing.cost += item.totalCost;
        existing.grossProfit += item.grossProfit;
        existing.netProfit += item.netProfit || 0;
        existing.fees += item.totalFees || 0;
        existing.orders += 1;
      } else {
        acc.push({
          date,
          revenue: item.totalRevenue,
          cost: item.totalCost,
          grossProfit: item.grossProfit,
          netProfit: item.netProfit || 0,
          fees: item.totalFees || 0,
          orders: 1
        });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days

  const statusComparison = [
    { status: 'Completed', orders: summary.completedOrders, revenue: completedOrders.reduce((sum, item) => sum + item.totalRevenue, 0) },
    { status: 'Pending', orders: summary.pendingOrders, revenue: pendingOrders.reduce((sum, item) => sum + item.totalRevenue, 0) }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Laporan Laba Rugi</h1>
            <p className="text-gray-600">Analisis profitabilitas berdasarkan status pesanan dan periode waktu</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Ekspor CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="order-status">Status Pesanan</Label>
                <Select value={filters.orderStatus} onValueChange={(value) => handleFilterChange('orderStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Pesanan</SelectItem>
                    <SelectItem value="COMPLETED">Hanya Selesai</SelectItem>
                    <SelectItem value="PENDING">Pesanan Tertunda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Tanggal Akhir</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="group-by">Kelompokkan Berdasarkan</Label>
                <Select value={filters.groupBy} onValueChange={(value) => handleFilterChange('groupBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Pesanan Individual</SelectItem>
                    <SelectItem value="daily">Ringkasan Harian</SelectItem>
                    <SelectItem value="monthly">Ringkasan Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold">{summary.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Tanpa HPP</p>
                  <p className="text-2xl font-bold">{summary.ordersWithoutHpp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold">{summary.completedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold">
                    Rp {summary.totalRevenue.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Laba Kotor</p>
                  <p className="text-2xl font-bold">
                    Rp {summary.totalGrossProfit.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Margin: {summary.overallGrossMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Fee</p>
                  <p className="text-2xl font-bold text-red-600">
                    Rp {summary.totalFees.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Platform & transaksi
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
                  <p className="text-2xl font-bold">
                    Rp {summary.totalNetProfit.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Margin: {summary.overallNetMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tren Harian Pendapatan & Laba</CardTitle>
              <CardDescription>Pendapatan vs Laba Kotor vs Laba Bersih dari waktu ke waktu</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Pendapatan" strokeWidth={2} />
                  <Line type="monotone" dataKey="grossProfit" stroke="#82ca9d" name="Laba Kotor" strokeWidth={2} />
                  <Line type="monotone" dataKey="netProfit" stroke="#ff7c7c" name="Laba Bersih" strokeWidth={2} />
                  <Line type="monotone" dataKey="fees" stroke="#ffc658" name="Total Fee" strokeWidth={1} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pesanan berdasarkan Status</CardTitle>
              <CardDescription>Perbandingan pesanan selesai vs tertunda</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip formatter={(value) => Number(value).toLocaleString('id-ID')} />
                  <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Tables with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
            <CardDescription>Analisis laba rugi detail berdasarkan status pesanan</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="completed">
                  Pesanan Selesai ({completedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pesanan Tertunda ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="no-hpp">
                  Tanpa HPP ({ordersWithoutHpp.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="completed" className="mt-4">
                <OrderTable orders={completedOrders} loading={loading} />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <OrderTable orders={pendingOrders} loading={loading} />
              </TabsContent>

              <TabsContent value="no-hpp" className="mt-4">
                <OrderTable orders={ordersWithoutHpp} loading={loading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Order Table Component
function OrderTable({ orders, loading }: { orders: PnLReportItem[], loading: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Pesanan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Pembayaran</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Pendapatan</TableHead>
            <TableHead>Biaya</TableHead>
            <TableHead>Laba Kotor</TableHead>
            <TableHead>Fee Total</TableHead>
            <TableHead>Laba Bersih</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8">
                Memuat pesanan...
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8">
                Tidak ada pesanan ditemukan untuk kategori ini.
              </TableCell>
            </TableRow>
          ) : (
            orders.slice(0, 100).map((order) => (
              <TableRow key={order.orderSn}>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {order.orderSn}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    order.orderStatus === 'COMPLETED' ? 'default' : 'secondary'
                  }>
                    {order.orderStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.orderDate).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  {order.paymentDate ? (
                    new Date(order.paymentDate).toLocaleDateString('id-ID')
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>{order.itemCount} item</TableCell>
                <TableCell>Rp {order.totalRevenue.toLocaleString('id-ID')}</TableCell>
                <TableCell>
                  {order.totalCost > 0 ? (
                    `Rp ${order.totalCost.toLocaleString('id-ID')}`
                  ) : (
                    <span className="text-gray-400">No HPP</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.grossProfit > 0 ? (
                    <span className="text-green-600">
                      Rp {order.grossProfit.toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.totalFees > 0 ? (
                    <span className="text-red-600">
                      Rp {order.totalFees.toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.netProfit !== undefined ? (
                    <span className={order.netProfit > 0 ? "text-green-600" : "text-red-600"}>
                      Rp {order.netProfit.toLocaleString('id-ID')}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.grossMargin > 0 ? (
                    <div className="space-y-1">
                      <Badge variant={
                        order.grossMargin > 30 ? 'default' :
                          order.grossMargin > 15 ? 'secondary' :
                            'outline'
                      }>
                        Kotor: {order.grossMargin.toFixed(1)}%
                      </Badge>
                      {order.netMargin !== undefined && (
                        <Badge variant={
                          order.netMargin > 20 ? 'default' :
                            order.netMargin > 10 ? 'secondary' :
                              order.netMargin > 0 ? 'outline' :
                                'destructive'
                        }>
                          Bersih: {order.netMargin.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline">No HPP</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/reports/orders/${order.orderSn}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {orders.length > 100 && (
        <div className="text-center py-4 text-sm text-gray-500">
          Menampilkan 100 pesanan pertama. Gunakan filter untuk mempersempit hasil.
        </div>
      )}
    </div>
  );
}