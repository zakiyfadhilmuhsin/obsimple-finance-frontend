'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shopeeAPI } from '@/lib/api';
import { Plus, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface ShopeeAccount {
  id: string;
  shopId: string;
  shopName?: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ShopeeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    fetchAccounts();
    fetchAuthUrl();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await shopeeAPI.getAccounts();
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthUrl = async () => {
    try {
      const response = await shopeeAPI.getAuthUrl();
      setAuthUrl(response.data.auth_url);
    } catch (error) {
      console.error('Failed to fetch auth URL:', error);
    }
  };

  const handleRefreshToken = async (accountId: string) => {
    try {
      await shopeeAPI.refreshAccount(accountId);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      return;
    }

    try {
      await shopeeAPI.deleteAccount(accountId);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Memuat akun...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Akun Shopee</h2>
            <p className="text-gray-600">Kelola akun penjual Shopee yang terhubung</p>
          </div>
          <Button 
            onClick={() => window.open(authUrl, '_blank')}
            disabled={!authUrl}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun
          </Button>
        </div>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">Tidak ada akun yang terhubung</h3>
                <p className="text-gray-600 mb-4">
                  Hubungkan akun penjual Shopee pertama Anda untuk memulai sinkronisasi pesanan dan pelaporan keuangan.
                </p>
                <Button 
                  onClick={() => window.open(authUrl, '_blank')}
                  disabled={!authUrl}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Hubungkan Akun Shopee
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {account.shopName || `Shop ${account.shopId}`}
                      </CardTitle>
                      <CardDescription>
                        Shop ID: {account.shopId}
                      </CardDescription>
                    </div>
                    <Badge variant={account.isActive ? 'default' : 'secondary'}>
                      {account.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Terhubung: {new Date(account.createdAt).toLocaleDateString()}</p>
                    <p>Berakhir: {new Date(account.expiresAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshToken(account.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Perbarui
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cara Menghubungkan Akun Shopee</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Klik tombol &quot;Tambah Akun&quot; di atas</li>
              <li>Anda akan diarahkan ke halaman otorisasi Shopee</li>
              <li>Masuk dengan kredensial akun penjual Shopee Anda</li>
              <li>Berikan izin untuk mengakses data toko Anda</li>
              <li>Anda akan diarahkan kembali dan akun Anda akan terhubung</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}