'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    // Check if user is already authenticated
    useEffect(() => {
        if (status === 'loading') return; // Still loading
        
        if (session) {
            router.push('/dashboard');
        }
    }, [session, status, router]);

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Don't render login form if already authenticated
    if (session) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error('Email atau kata sandi tidak valid');
            } else if (result?.ok) {
                toast.success('Berhasil masuk!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Terjadi kesalahan saat masuk');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Masuk ke Akun Anda
                    </CardTitle>
                    <CardDescription className="text-center">
                        Masukkan email dan kata sandi untuk mengakses dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Masukkan kata sandi Anda"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-green-500 hover:bg-green-600" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sedang masuk...' : 'Masuk'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Belum punya akun? </span>
                        <Link 
                            href="/auth/register" 
                            className="text-primary hover:underline"
                        >
                            Daftar
                        </Link>
                    </div>

                    {/* Show error message from URL params */}
                    {searchParams.get('error') && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">
                                {searchParams.get('error') === 'CredentialsSignin' 
                                    ? 'Email atau kata sandi tidak valid' 
                                    : 'Terjadi kesalahan saat masuk'
                                }
                            </p>
                        </div>
                    )}

                    {/* Show session expired message */}
                    {searchParams.get('session') === 'expired' && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <p className="text-sm text-orange-600">
                                Sesi Anda telah berakhir. Silakan masuk kembali.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}