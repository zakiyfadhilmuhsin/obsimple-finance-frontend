'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard,
  RefreshCw,
  PlayCircle,
  Activity,
  AlertCircle
} from 'lucide-react';
import { financeAPI } from '@/lib/api';

interface FinanceOverview {
  totalOrders: number;
  completedOrders: number;
  ordersWithEscrow: number;
  escrowCoverage: string;
  financialSummary: {
    totalEscrowAmount: number;
    totalCommissionFee: number;
    totalServiceFee: number;
  };
}

interface SchedulerStatus {
  jobs: Array<{
    name: string;
    description: string;
    schedule: string;
    cron: string;
    timezone: string;
    active: boolean;
  }>;
  currentTime: string;
  timezone: string;
}

export function FinanceDashboard() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [triggeringScheduler, setTriggeringScheduler] = useState(false);

  const fetchOverview = async () => {
    try {
      const response = await financeAPI.getOverview();
      setOverview(response.data);
    } catch (error) {
      console.error('Failed to fetch finance overview:', error);
    }
  };

  const fetchSchedulerStatus = async () => {
    try {
      const response = await financeAPI.getSchedulerStatus();
      setSchedulerStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    }
  };

  const handleProcessCompleted = async () => {
    setProcessing(true);
    try {
      const response = await financeAPI.processCompletedOrders();
      console.log('Escrow processing result:', response.data);
      // Refresh overview after processing
      await fetchOverview();
      alert(`Processing completed! ${response.data.data.processed} orders processed.`);
    } catch (error) {
      console.error('Failed to process completed orders:', error);
      alert('Failed to process completed orders. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleTriggerScheduler = async () => {
    setTriggeringScheduler(true);
    try {
      const response = await financeAPI.triggerScheduler();
      console.log('Scheduler trigger result:', response.data);
      alert('Scheduler triggered successfully!');
    } catch (error) {
      console.error('Failed to trigger scheduler:', error);
      alert('Failed to trigger scheduler. Please try again.');
    } finally {
      setTriggeringScheduler(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchSchedulerStatus()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(overview.totalOrders)}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(overview.completedOrders)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders with Escrow</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(overview.ordersWithEscrow)}
                </p>
                <Badge variant={parseFloat(overview.escrowCoverage) >= 80 ? "default" : "destructive"}>
                  {overview.escrowCoverage}% coverage
                </Badge>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Escrow Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview.financialSummary.totalEscrowAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Financial Summary */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Commission Fee</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(overview.financialSummary.totalCommissionFee)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Service Fee</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(overview.financialSummary.totalServiceFee)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Net Escrow Amount</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(
                      overview.financialSummary.totalEscrowAmount - 
                      overview.financialSummary.totalCommissionFee - 
                      overview.financialSummary.totalServiceFee
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Manual Controls */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Controls</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Process escrow data for completed orders</p>
                <Button 
                  onClick={handleProcessCompleted} 
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Process Completed Orders
                    </>
                  )}
                </Button>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Manually trigger escrow scheduler</p>
                <Button 
                  onClick={handleTriggerScheduler} 
                  disabled={triggeringScheduler}
                  variant="outline"
                  className="w-full"
                >
                  {triggeringScheduler ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Triggering...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Trigger Scheduler
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Scheduler Status */}
      {schedulerStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduler Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Current Time: {new Date(schedulerStatus.currentTime).toLocaleString()}</span>
              <span>Timezone: {schedulerStatus.timezone}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedulerStatus.jobs.map((job, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{job.name}</h4>
                    <Badge variant={job.active ? "default" : "secondary"}>
                      {job.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                  <div className="text-xs text-gray-500">
                    <p>Schedule: {job.schedule}</p>
                    <p>Cron: {job.cron}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Coverage Alert */}
      {overview && parseFloat(overview.escrowCoverage) < 80 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Low Escrow Coverage Detected
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Only {overview.escrowCoverage}% of completed orders have escrow data. 
                Consider running manual processing or checking API connectivity.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}