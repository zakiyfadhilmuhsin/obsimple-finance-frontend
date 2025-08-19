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
import { HppInputDialog } from '@/components/hpp/hpp-input-dialog';
import { reportsAPI } from '@/lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Percent,
  Search,
  Filter,
  Download,
  Settings
} from 'lucide-react';

interface ProductReportItem {
  sku: string;
  itemName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  avgSellingPrice: number;
  avgHpp: number;
  totalOrders: number;
  firstSaleDate: string;
  lastSaleDate: string;
}

interface ReportSummary {
  totalSkus: number;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  overallMargin: number;
  skusWithoutHpp: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductReportsPage() {
  const [data, setData] = useState<ProductReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalSkus: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalGrossProfit: 0,
    overallMargin: 0,
    skusWithoutHpp: 0
  });
  const [loading, setLoading] = useState(false);
  const [hppDialogOpen, setHppDialogOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    sku: '',
    startDate: '',
    endDate: '',
    orderStatus: 'all'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getProductReport(filters);
      setData(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading product report:', error);
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
      ['SKU', 'Product Name', 'Quantity Sold', 'Revenue', 'Cost', 'Gross Profit', 'Margin %', 'Avg Price', 'Avg HPP', 'Orders'],
      ...data.map(item => [
        item.sku,
        item.itemName,
        item.totalQuantitySold,
        item.totalRevenue,
        item.totalCost,
        item.grossProfit,
        item.grossMargin.toFixed(2),
        item.avgSellingPrice,
        item.avgHpp,
        item.totalOrders
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-performance-report.csv';
    a.click();
  };

  // Prepare chart data
  const topProductsByRevenue = data
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10)
    .map(item => ({
      sku: item.sku.length > 8 ? item.sku.substring(0, 8) + '...' : item.sku,
      revenue: item.totalRevenue,
      profit: item.grossProfit
    }));

  const marginDistribution = [
    { name: 'High Margin (>30%)', value: data.filter(item => item.grossMargin > 30).length },
    { name: 'Good Margin (15-30%)', value: data.filter(item => item.grossMargin >= 15 && item.grossMargin <= 30).length },
    { name: 'Low Margin (5-15%)', value: data.filter(item => item.grossMargin >= 5 && item.grossMargin < 15).length },
    { name: 'Poor Margin (<5%)', value: data.filter(item => item.grossMargin < 5).length },
    { name: 'No HPP Set', value: summary.skusWithoutHpp }
  ].filter(item => item.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Product Performance Report</h1>
            <p className="text-gray-600">Analyze sales performance and profitability by SKU</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setHppDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage HPP
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="sku-search">Search SKU</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="sku-search"
                    value={filters.sku}
                    onChange={(e) => handleFilterChange('sku', e.target.value)}
                    placeholder="Enter SKU..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="order-status">Order Status</Label>
                <Select value={filters.orderStatus} onValueChange={(value) => handleFilterChange('orderStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="COMPLETED">Completed Only</SelectItem>
                    <SelectItem value="PENDING">Pending Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total SKUs</p>
                  <p className="text-2xl font-bold">{summary.totalSkus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
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
                  <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                  <p className="text-2xl font-bold">
                    Rp {summary.totalGrossProfit.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Percent className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Margin</p>
                  <p className="text-2xl font-bold">{summary.overallMargin.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">SKUs w/o HPP</p>
                  <p className="text-2xl font-bold">{summary.skusWithoutHpp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Products by Revenue</CardTitle>
              <CardDescription>Revenue vs Gross Profit comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsByRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sku" />
                  <YAxis />
                  <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="profit" fill="#82ca9d" name="Gross Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Margin Distribution</CardTitle>
              <CardDescription>Distribution of products by profit margin</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={marginDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marginDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Product Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Performance Details</CardTitle>
            <CardDescription>Detailed performance metrics for each SKU</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Qty Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>HPP</TableHead>
                    <TableHead>Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No products found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.slice(0, 100).map((product) => (
                      <TableRow key={product.sku}>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {product.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={product.itemName}>
                            {product.itemName}
                          </div>
                        </TableCell>
                        <TableCell>{product.totalQuantitySold}</TableCell>
                        <TableCell>Rp {product.totalRevenue.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          {product.totalCost > 0 ? (
                            `Rp ${product.totalCost.toLocaleString('id-ID')}`
                          ) : (
                            <span className="text-gray-400">No HPP</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.grossProfit > 0 ? (
                            <span className="text-green-600">
                              Rp {product.grossProfit.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.grossMargin > 0 ? (
                            <Badge variant={
                              product.grossMargin > 30 ? 'default' :
                              product.grossMargin > 15 ? 'secondary' :
                              product.grossMargin > 5 ? 'outline' : 'destructive'
                            }>
                              {product.grossMargin.toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">No HPP</Badge>
                          )}
                        </TableCell>
                        <TableCell>Rp {product.avgSellingPrice.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          {product.avgHpp > 0 ? (
                            `Rp ${product.avgHpp.toLocaleString('id-ID')}`
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>{product.totalOrders}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {data.length > 100 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Showing first 100 products. Use filters to narrow results.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* HPP Input Dialog */}
        <HppInputDialog
          open={hppDialogOpen}
          onClose={() => setHppDialogOpen(false)}
          onSuccess={loadData}
        />
      </div>
    </DashboardLayout>
  );
}