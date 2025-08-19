'use client';

import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {

  const features = [
    {
      title: 'Manajemen Akun Shopee',
      description: 'Hubungkan dan kelola akun penjual Shopee Anda dengan integrasi OAuth',
      icon: Store,
      href: '/dashboard/accounts',
      color: 'text-blue-600',
    },
    {
      title: 'Manajemen Pesanan',
      description: 'Sinkronkan dan lihat pesanan dari akun Shopee yang terhubung',
      icon: ShoppingCart,
      href: '/dashboard/orders',
      color: 'text-green-600',
    },
    {
      title: 'Laporan Keuangan',
      description: 'Lihat data escrow, informasi pembayaran, dan wawasan keuangan',
      icon: DollarSign,
      href: '/dashboard/finance',
      color: 'text-yellow-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Selamat Datang di Dashboard Anda</h2>
          <p className="mt-2 text-gray-600">
            Kelola akun Shopee, pesanan, dan data keuangan Anda dalam satu tempat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button variant="outline" className="w-full">
                      Mulai
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Panduan Cepat</CardTitle>
            <CardDescription>Ikuti langkah-langkah berikut untuk memulai</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Hubungkan akun penjual Shopee Anda menggunakan autentikasi OAuth</li>
              <li>Sinkronkan pesanan Anda untuk mengimpor data pesanan dari Shopee</li>
              <li>Lihat laporan keuangan dan informasi escrow</li>
              <li>Pantau kinerja penjualan dan status pembayaran Anda</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}