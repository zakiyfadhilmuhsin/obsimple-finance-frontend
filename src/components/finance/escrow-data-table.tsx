'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, 
  Download, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { financeAPI } from '@/lib/api';

interface EscrowDataItem {
  id: string;
  orderSn: string;
  payoutAmount: number;
  escrowReleaseTime: string;
  escrowAmount: number | null;
  serviceFee: number | null;
  commissionFee: number | null;
  buyerUserName: string | null;
  buyerPaymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    orderSn: string;
    orderStatus: string;
    totalAmount: number | null;
    createTime: string;
    shopeeAccount: {
      shopId: string;
      shopName: string | null;
    };
  };
}

interface EscrowDataResponse {
  data: EscrowDataItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Filters {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  page: number;
  limit: number;
}

export function EscrowDataTable() {
  const [data, setData] = useState<EscrowDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchEscrowData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        ...(searchTerm && { search: searchTerm }),
      };
      
      const response = await financeAPI.getEscrowData(params);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch escrow data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchEscrowData();
  }, [fetchEscrowData]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      page: 1,
    }));
    fetchEscrowData();
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
    setSearchTerm('');
  };

  const exportData = () => {
    if (!data?.data.length) return;
    
    // Simple CSV export
    const headers = [
      'Order SN',
      'Shop Name',
      'Order Status',
      'Total Amount',
      'Escrow Amount',
      'Service Fee',
      'Commission Fee',
      'Buyer Username',
      'Payment Method',
      'Created Date'
    ].join(',');
    
    const rows = data.data.map(item => [
      item.order.orderSn,
      item.order.shopeeAccount.shopName || 'N/A',
      item.order.orderStatus,
      item.order.totalAmount || 0,
      item.escrowAmount || 0,
      item.serviceFee || 0,
      item.commissionFee || 0,
      item.buyerUserName || 'N/A',
      item.buyerPaymentMethod || 'N/A',
      new Date(item.createdAt).toLocaleDateString()
    ].join(','));
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escrow-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
      'COMPLETED': 'default',
      'SHIPPED': 'secondary',
      'CANCELLED': 'destructive',
    };
    
    return (
      <Badge variant={statusColors[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Escrow Data</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={exportData}
            disabled={!data?.data.length}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={fetchEscrowData} 
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="search">Search Order SN</Label>
              <div className="flex mt-1">
                <Input
                  id="search"
                  placeholder="Enter order SN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} className="ml-2">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="minAmount">Min Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="Minimum escrow amount"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="Maximum escrow amount"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order SN</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Amount</TableHead>
                <TableHead>Escrow Amount</TableHead>
                <TableHead>Service Fee</TableHead>
                <TableHead>Commission Fee</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(10)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="animate-pulse bg-gray-200 rounded h-4"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length ? (
                data.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.order.orderSn}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.order.shopeeAccount.shopName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.order.shopeeAccount.shopId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.order.orderStatus)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.order.totalAmount)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(item.escrowAmount)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(item.serviceFee)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(item.commissionFee)}
                    </TableCell>
                    <TableCell>
                      {item.buyerUserName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.buyerPaymentMethod || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500">
                      <DollarSign className="h-12 w-12 mb-4" />
                      <p>No escrow data found</p>
                      <p className="text-sm">Try adjusting your filters or sync more orders</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} entries
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={data.pagination.page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, data.pagination.pages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={data.pagination.page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={data.pagination.page === data.pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}