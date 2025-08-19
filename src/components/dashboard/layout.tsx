'use client';

import { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Store, 
  ShoppingCart, 
  DollarSign, 
  LogOut,
  User,
  BarChart3,
  TrendingUp,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/auth/login'
    });
  };

  const navigation = [
    {
      name: 'Akun Shopee',
      href: '/dashboard/accounts',
      icon: Store,
      description: 'Kelola akun Shopee Anda',
    },
    {
      name: 'Pesanan',
      href: '/dashboard/orders',
      icon: ShoppingCart,
      description: 'Lihat dan sinkronkan pesanan',
    },
    {
      name: 'Keuangan',
      href: '/dashboard/finance',
      icon: DollarSign,
      description: 'Laporan keuangan dan data escrow',
    },
  ];

  const reportNavigation = [
    {
      name: 'Performa Produk',
      href: '/dashboard/reports/products',
      description: 'Penjualan & profitabilitas per SKU',
    },
    {
      name: 'Laba Rugi',
      href: '/dashboard/reports/pnl',
      description: 'Analisis laba rugi berdasarkan status pesanan',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#20B66E' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Keuangan Shopee
              </h1> */}
              <img src='/images/logo-reverse.png' alt='obsimple-logo' width={110} />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-white" />
                <span className="text-sm text-white">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: 'white' }} className='hover:bg-green-600'>
                <LogOut className="h-4 w-4 mr-2 text-white" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Reports Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <BarChart3 className="h-4 w-4" />
                    <span>Laporan</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {reportNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-start space-x-3 p-3">
                        <TrendingUp className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
                
                {/* Mobile Reports Section */}
                <div className="pt-2 border-t">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Laporan</div>
                  {reportNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}