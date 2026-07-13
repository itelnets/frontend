'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill out all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });

            if (data.role !== 'admin') {
                toast.error('Access denied. Administrator privileges required.');
                return;
            }

            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            toast.success('Admin login successful');
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/admin');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 min-h-screen bg-gray-900 items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6 bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Admin Access</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Sign in to the administration portal
                    </p>
                </div>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Admin Email
                            </label>
                            <div className="mt-1 flex rounded-md border border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden transition duration-200">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-3 py-2 sm:px-4 sm:py-3 placeholder-gray-500 outline-none text-sm bg-gray-700 text-white"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border border-gray-600 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 transition duration-200 outline-none text-sm bg-gray-700 text-white pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In as Admin'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <a href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL}/login`} className="text-sm text-gray-400 hover:text-white transition">
                            &larr; Back to Customer Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
