'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { reportsAPI } from '@/lib/api';
import { 
  ArrowLeft,
  Package, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Info,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface OrderCostDetail {
  order: {
    orderSn: string;
    orderStatus: string;
    orderDate: string;
    paymentDate?: string;
    shopName: string;
    totalAmount: number;
  };
  itemDetails: Array<{
    sku: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalRevenue: number;
    hpp: number | null;
    totalCost: number | null;
    grossProfit: number | null;
    margin: number | null;
  }>;
  orderCosts: {
    totalRevenue: number;
    totalProductCost: number;
    commissionFee: number;
    serviceFee: number;
    transactionFee: number;
    shippingFee: number;
    paymentChannelFee: number;
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
  };
  escrowDetails?: {
    payoutAmount: number;
    escrowReleaseTime: string;
    buyerPaymentMethod: string;
  } | null;
}

export default function OrderCostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderSn = params.orderSn as string;
  
  const [data, setData] = useState<OrderCostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrderDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsAPI.getOrderCostReport(orderSn);
      setData(response.data);
    } catch (error: any) {
      console.error('Error loading order detail:', error);
      setError(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderSn]);

  useEffect(() => {
    if (orderSn) {
      loadOrderDetail();
    }
  }, [orderSn, loadOrderDetail]);

  const exportOrderDetail = () => {
    if (!data) return;

    const csvContent = [
      ['Order Cost Breakdown Report'],
      ['Order SN', data.order.orderSn],
      ['Order Status', data.order.orderStatus],
      ['Order Date', new Date(data.order.orderDate).toLocaleDateString('id-ID')],
      ['Shop', data.order.shopName],
      [''],
      ['Item Details'],
      ['SKU', 'Product Name', 'Quantity', 'Unit Price', 'Revenue', 'HPP', 'Cost', 'Profit', 'Margin %'],
      ...data.itemDetails.map(item => [
        item.sku,
        item.itemName,
        item.quantity,
        item.unitPrice,
        item.totalRevenue,
        item.hpp || 0,
        item.totalCost || 0,
        item.grossProfit || 0,
        item.margin ? item.margin.toFixed(2) : '0'
      ]),
      [''],
      ['Order Level Costs'],
      ['Total Revenue', data.orderCosts.totalRevenue],
      ['Product Cost', data.orderCosts.totalProductCost],
      ['Commission Fee', data.orderCosts.commissionFee],
      ['Service Fee', data.orderCosts.serviceFee],
      ['Transaction Fee', data.orderCosts.transactionFee],
      ['Shipping Fee', data.orderCosts.shippingFee],
      ['Payment Channel Fee', data.orderCosts.paymentChannelFee],
      ['Gross Profit', data.orderCosts.grossProfit],
      ['Net Profit', data.orderCosts.netProfit],
      ['Gross Margin %', data.orderCosts.grossMargin.toFixed(2)],
      ['Net Margin %', data.orderCosts.netMargin.toFixed(2)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-cost-detail-${orderSn}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Order Details</h2>
          <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const hasAllHpp = data.itemDetails.every(item => item.hpp !== null);
  const itemsWithoutHpp = data.itemDetails.filter(item => item.hpp === null).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order Cost Breakdown</h1>
              <p className="text-gray-600">Detailed cost analysis for order {data.order.orderSn}</p>
            </div>
          </div>
          <Button variant="outline" onClick={exportOrderDetail}>
            <Download className="h-4 w-4 mr-2" />
            Export Detail
          </Button>
        </div>

        {/* Order Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Order Information</CardTitle>
                <CardDescription>Basic order details and status</CardDescription>
              </div>
              <Badge variant={data.order.orderStatus === 'COMPLETED' ? 'default' : 'secondary'}>
                {data.order.orderStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Order SN</p>
                <p className="text-lg font-mono">{data.order.orderSn}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Shop</p>
                <p className="text-lg">{data.order.shopName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Order Date</p>
                <p className="text-lg">{new Date(data.order.orderDate).toLocaleDateString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Date</p>
                <p className="text-lg">
                  {data.order.paymentDate 
                    ? new Date(data.order.paymentDate).toLocaleDateString('id-ID')
                    : 'Not paid'
                  }
                </p>
              </div>
            </div>

            {!hasAllHpp && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">
                      {itemsWithoutHpp} item(s) missing HPP data
                    </p>
                    <p className="text-sm text-orange-700">
                      Cost calculations are incomplete. Please set HPP for accurate profit analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    Rp {data.orderCosts.totalRevenue.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Product Cost</p>
                  <p className="text-2xl font-bold">
                    Rp {data.orderCosts.totalProductCost.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {data.orderCosts.grossProfit.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    data.orderCosts.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Rp {data.orderCosts.netProfit.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Item Details */}
        <Card>
          <CardHeader>
            <CardTitle>Item-Level Breakdown</CardTitle>
            <CardDescription>Product-wise cost and profit analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>HPP</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.itemDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {item.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={item.itemName}>
                        {item.itemName}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>Rp {item.unitPrice.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {item.totalRevenue.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      {item.hpp ? (
                        `Rp ${item.hpp.toLocaleString('id-ID')}`
                      ) : (
                        <span className="text-orange-600">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.totalCost ? (
                        `Rp ${item.totalCost.toLocaleString('id-ID')}`
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.grossProfit ? (
                        <span className={item.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          Rp {item.grossProfit.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.margin ? (
                        <Badge variant={
                          item.margin > 30 ? 'default' :
                          item.margin > 15 ? 'secondary' :
                          item.margin > 5 ? 'outline' : 'destructive'
                        }>
                          {item.margin.toFixed(1)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">No HPP</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.hpp ? (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Missing HPP
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order-Level Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Order-Level Cost Breakdown</CardTitle>
            <CardDescription>Platform fees and operational costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-3">Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-medium">
                        Rp {data.orderCosts.totalRevenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-red-600 mb-3">Costs</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Product Cost (HPP)</span>
                      <span>Rp {data.orderCosts.totalProductCost.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission Fee</span>
                      <span>Rp {data.orderCosts.commissionFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>Rp {data.orderCosts.serviceFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Fee</span>
                      <span>Rp {data.orderCosts.transactionFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span>Rp {data.orderCosts.shippingFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Channel Fee</span>
                      <span>Rp {data.orderCosts.paymentChannelFee.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-600 mb-3">Profitability</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Gross Profit</span>
                      <span className="font-bold text-green-600">
                        Rp {data.orderCosts.grossProfit.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Net Profit</span>
                      <span className={`font-bold ${
                        data.orderCosts.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rp {data.orderCosts.netProfit.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-purple-600 mb-3">Margins</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Gross Margin</span>
                      <span className="font-bold">
                        {data.orderCosts.grossMargin.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Net Margin</span>
                      <span className={`font-bold ${
                        data.orderCosts.netMargin >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.orderCosts.netMargin.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Details (if available) */}
        {data.escrowDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Escrow Information
              </CardTitle>
              <CardDescription>Payment and escrow release details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payout Amount</p>
                  <p className="text-lg font-bold">
                    Rp {data.escrowDetails.payoutAmount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <p className="text-lg">{data.escrowDetails.buyerPaymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Escrow Release</p>
                  <p className="text-lg">
                    {new Date(data.escrowDetails.escrowReleaseTime).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}