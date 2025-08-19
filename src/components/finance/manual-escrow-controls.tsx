'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCw, 
  PlayCircle,
  Activity,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { financeAPI, shopeeAPI } from '@/lib/api';

interface ShopeeAccount {
  id: string;
  shopId: string;
  shopName: string;
  isActive: boolean;
}

export function ManualEscrowControls() {
  const [processing, setProcessing] = useState(false);
  const [triggeringScheduler, setTriggeringScheduler] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);
  const [fetchingBatch, setFetchingBatch] = useState(false);
  
  // Manual fetch states
  const [selectedAccount, setSelectedAccount] = useState('');
  const [shopeeAccounts, setShopeeAccounts] = useState<ShopeeAccount[]>([]);
  const [releaseTimeFrom, setReleaseTimeFrom] = useState('');
  const [releaseTimeTo, setReleaseTimeTo] = useState('');
  const [orderSnList, setOrderSnList] = useState('');
  const [pageSize, setPageSize] = useState('40');
  
  const [lastResult, setLastResult] = useState<any>(null);

  // Load Shopee accounts
  const loadShopeeAccounts = async () => {
    try {
      const response = await shopeeAPI.getAccounts();
      setShopeeAccounts(response.data);
    } catch (error) {
      console.error('Failed to load Shopee accounts:', error);
    }
  };

  const handleProcessCompleted = async () => {
    setProcessing(true);
    try {
      const response = await financeAPI.processCompletedOrders();
      setLastResult({
        type: 'success',
        title: 'Processing Completed Successfully',
        message: `${response.data.data.processed} orders processed with ${response.data.data.errorsCount} errors`,
        data: response.data
      });
    } catch (error: any) {
      setLastResult({
        type: 'error',
        title: 'Processing Failed',
        message: error.response?.data?.message || error.message || 'Unknown error occurred',
        data: null
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleTriggerScheduler = async () => {
    setTriggeringScheduler(true);
    try {
      const response = await financeAPI.triggerScheduler();
      setLastResult({
        type: 'success',
        title: 'Scheduler Triggered Successfully',
        message: response.data.message,
        data: response.data
      });
    } catch (error: any) {
      setLastResult({
        type: 'error',
        title: 'Scheduler Trigger Failed',
        message: error.response?.data?.message || error.message || 'Unknown error occurred',
        data: null
      });
    } finally {
      setTriggeringScheduler(false);
    }
  };

  const handleFetchEscrowList = async () => {
    if (!selectedAccount || !releaseTimeFrom || !releaseTimeTo) {
      alert('Please fill in all required fields');
      return;
    }

    setFetchingList(true);
    try {
      const data = {
        shopeeAccountId: selectedAccount,
        releaseTimeFrom: Math.floor(new Date(releaseTimeFrom).getTime() / 1000).toString(),
        releaseTimeTo: Math.floor(new Date(releaseTimeTo).getTime() / 1000).toString(),
        pageSize,
      };

      const response = await financeAPI.fetchEscrowList(data);
      setLastResult({
        type: 'success',
        title: 'Escrow List Retrieved',
        message: `Retrieved ${response.data?.escrow_list?.length || 0} escrow records`,
        data: response.data
      });
    } catch (error: any) {
      setLastResult({
        type: 'error',
        title: 'Failed to Fetch Escrow List',
        message: error.response?.data?.message || error.message || 'Unknown error occurred',
        data: null
      });
    } finally {
      setFetchingList(false);
    }
  };

  const handleFetchEscrowBatch = async () => {
    if (!selectedAccount || !orderSnList.trim()) {
      alert('Please select account and enter order SNs');
      return;
    }

    const orderSns = orderSnList
      .split('\n')
      .map(sn => sn.trim())
      .filter(sn => sn.length > 0);

    if (orderSns.length === 0) {
      alert('Please enter at least one order SN');
      return;
    }

    if (orderSns.length > 50) {
      alert('Maximum 50 order SNs allowed per batch');
      return;
    }

    setFetchingBatch(true);
    try {
      const data = {
        shopeeAccountId: selectedAccount,
        orderSnList: orderSns,
      };

      const response = await financeAPI.fetchEscrowDetailBatch(data);
      setLastResult({
        type: 'success',
        title: 'Escrow Detail Batch Retrieved',
        message: `Retrieved ${response.data?.length || 0} escrow detail records`,
        data: response.data
      });
    } catch (error: any) {
      setLastResult({
        type: 'error',
        title: 'Failed to Fetch Escrow Details',
        message: error.response?.data?.message || error.message || 'Unknown error occurred',
        data: null
      });
    } finally {
      setFetchingBatch(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Manual Escrow Controls</h2>
        <Button variant="outline" onClick={loadShopeeAccounts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Load Accounts
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Processing</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Process escrow data for all completed orders across all accounts
              </p>
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
                    Process All Completed Orders
                  </>
                )}
              </Button>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">
                Manually trigger the scheduled escrow processing job
              </p>
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

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual API Calls</h3>
          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={loadShopeeAccounts}>
                  <Download className="h-4 w-4 mr-2" />
                  Fetch Escrow List
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Fetch Escrow List</DialogTitle>
                  <DialogDescription>
                    Fetch escrow list for a specific time range
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account">Shopee Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {shopeeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.shopName || account.shopId} ({account.shopId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="releaseFrom">Release Time From</Label>
                    <Input
                      id="releaseFrom"
                      type="datetime-local"
                      value={releaseTimeFrom}
                      onChange={(e) => setReleaseTimeFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="releaseTo">Release Time To</Label>
                    <Input
                      id="releaseTo"
                      type="datetime-local"
                      value={releaseTimeTo}
                      onChange={(e) => setReleaseTimeTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pageSize">Page Size (max 40)</Label>
                    <Input
                      id="pageSize"
                      type="number"
                      min="1"
                      max="40"
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleFetchEscrowList} disabled={fetchingList}>
                    {fetchingList ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      'Fetch List'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={loadShopeeAccounts}>
                  <Upload className="h-4 w-4 mr-2" />
                  Fetch Escrow Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Fetch Escrow Detail Batch</DialogTitle>
                  <DialogDescription>
                    Fetch detailed escrow data for specific orders
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batchAccount">Shopee Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {shopeeAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.shopName || account.shopId} ({account.shopId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="orderSns">Order SNs (one per line, max 50)</Label>
                    <textarea
                      id="orderSns"
                      className="w-full h-32 p-2 border rounded-md resize-none"
                      placeholder="240101ABC123&#10;240101DEF456&#10;240101GHI789"
                      value={orderSnList}
                      onChange={(e) => setOrderSnList(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Lines: {orderSnList.split('\n').filter(s => s.trim()).length}/50
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleFetchEscrowBatch} disabled={fetchingBatch}>
                    {fetchingBatch ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      'Fetch Details'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>

      {/* Results */}
      {lastResult && (
        <Card className="p-6">
          <div className="flex items-start space-x-3">
            {lastResult.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium ${
                  lastResult.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {lastResult.title}
                </h3>
                <div className="flex space-x-2">
                  {lastResult.data && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadJson(
                        lastResult.data, 
                        `escrow-result-${Date.now()}.json`
                      )}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLastResult(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              <p className={`text-sm mt-1 ${
                lastResult.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {lastResult.message}
              </p>
              {lastResult.data && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-gray-600 hover:text-gray-800">
                    View Raw Response
                  </summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto max-h-60">
                    {JSON.stringify(lastResult.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Help Text */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-gray-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Usage Guide</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• <strong>Process All Completed Orders:</strong> Automatically processes escrow data for orders with COMPLETED status</p>
              <p>• <strong>Trigger Scheduler:</strong> Manually runs the background scheduler job</p>
              <p>• <strong>Fetch Escrow List:</strong> Get list of escrow records for a time range</p>
              <p>• <strong>Fetch Escrow Details:</strong> Get detailed financial data for specific orders</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}