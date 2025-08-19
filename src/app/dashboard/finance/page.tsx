'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FinanceDashboard } from '@/components/finance/finance-dashboard';
import { EscrowDataTable } from '@/components/finance/escrow-data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  BarChart3, 
  Table, 
  Settings,
  HelpCircle
} from 'lucide-react';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Keuangan & Escrow</h1>
            <p className="text-gray-600 mt-1">
              Pantau data keuangan dan transaksi escrow Anda
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Table className="h-4 w-4" />
              <span>Data Escrow</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <FinanceDashboard />
          </TabsContent>

          {/* Data Table Tab */}
          <TabsContent value="data" className="space-y-6">
            <EscrowDataTable />
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Cara Kerja Pemrosesan Escrow
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Pemrosesan Otomatis:</strong> Data escrow diambil secara otomatis ketika pesanan ditandai sebagai SELESAI</p>
                <p>• <strong>Tugas Terjadwal:</strong> Sistem berjalan setiap 2 jam untuk memproses escrow untuk semua pesanan yang selesai</p>
                <p>• <strong>Pemrosesan Manual:</strong> Gunakan tombol &quot;Proses Pesanan Selesai&quot; untuk memicu pemrosesan escrow secara manual</p>
                <p>• <strong>Cakupan Data:</strong> Pantau persentase cakupan escrow untuk memastikan semua pesanan selesai memiliki data keuangan</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}