'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if user is already authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const session = await getSession();
            if (session) {
                router.push('/dashboard');
            }
        };
        checkAuth();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Kata sandi tidak cocok');
            return;
        }

        if (password.length < 8) {
            toast.error('Kata sandi harus minimal 8 karakter');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            toast.success('Pendaftaran berhasil! Sedang masuk...');
            
            // Automatically sign in after successful registration
            const signInResult = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                toast.error('Pendaftaran berhasil, tetapi gagal masuk. Silakan coba masuk secara manual.');
                router.push('/auth/login');
            }

        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Pendaftaran gagal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Buat Akun Anda
                    </CardTitle>
                    <CardDescription className="text-center">
                        Masukkan detail Anda untuk memulai dengan Laporan Keuangan Shopee
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Masukkan nama lengkap Anda"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

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
                                placeholder="Pilih kata sandi (min. 8 karakter)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Konfirmasi kata sandi Anda"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={8}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-green-500 hover:bg-green-600" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Membuat akun...' : 'Buat Akun'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Sudah punya akun? </span>
                        <Link 
                            href="/auth/login" 
                            className="text-primary hover:underline"
                        >
                            Masuk
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}