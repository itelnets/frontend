'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordErrors, setShowPasswordErrors] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            router.push('/');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || (!isForgotPassword && !password)) {
            toast.error('Please fill out all required fields');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|co\.in|edu|gov|io|co)$/i;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email format');
            return;
        }

        if (!isForgotPassword) {
            setShowPasswordErrors(true);
            if (password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
            if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
                return;
            }
        }

        if (isForgotPassword) {
            const lastSentStr = localStorage.getItem(`reset_sent_${email}`);
            if (lastSentStr && Date.now() - parseInt(lastSentStr, 10) < 2 * 60 * 1000) {
                toast.error('Link already sent. Try after 2 minutes');
                return;
            }

            setIsLoading(true);
            try {
                const { data } = await api.post('/auth/forgot-password', { email });
                localStorage.setItem(`reset_sent_${email}`, Date.now().toString());
                toast.success(data.message);
                await new Promise(resolve => setTimeout(resolve, 1500));
                setIsForgotPassword(false);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to send reset link');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            console.log('Login success:', data);
            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            toast.success(data.message);
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (data.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 bg-[#f4f5f6] items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6 bg-white p-5 sm:p-8 rounded-xl shadow-md border border-gray-100">
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        type="button"
                        className="flex-1 py-2.5 text-center text-[16px] sm:text-lg font-bold text-[#458500] border-b-2 border-[#458500]"
                    >
                        Sign In
                    </button>
                    <Link
                        href="/register"
                        className="flex-1 py-2.5 text-center text-[16px] sm:text-lg font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Create Account
                    </Link>
                </div>

                <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                        {isForgotPassword ? 'Enter your email to receive a reset link' : 'Welcome back to Itelents'}
                    </p>
                </div>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="mt-1 flex rounded-md border border-gray-300 focus-within:border-[#458500] focus-within:ring-1 focus-within:ring-[#458500] overflow-hidden transition duration-200">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-3 py-2 sm:px-4 sm:py-3 placeholder-gray-400 outline-none text-sm bg-white"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {!isForgotPassword && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                                        className="block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md border border-gray-300 placeholder-gray-400 focus:border-[#458500] focus:ring-[#458500] transition duration-200 outline-none text-sm pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-700 cursor-pointer focus:outline-none"
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
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[A-Z]/.test(password) ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && !/[A-Z]/.test(password) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Capital</span>
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[a-z]/.test(password) ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && !/[a-z]/.test(password) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Lowercase</span>
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[0-9]/.test(password) ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && !/[0-9]/.test(password) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Numeric</span>
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[^A-Za-z0-9]/.test(password) && password.length > 0 ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && (!/[^A-Za-z0-9]/.test(password) || password.length === 0) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Special</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isForgotPassword && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="font-medium text-[#458500] hover:text-[#3b7100] cursor-pointer transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#458500] hover:bg-[#3b7100] focus:outline-none cursor-pointer transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Spinner /> : (isForgotPassword ? 'Send Reset Link' : 'Sign In')}
                        </button>
                    </div>

                    {isForgotPassword && (
                        <div className="text-center text-sm text-gray-600">
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="font-medium text-[#458500] hover:text-[#3b7100] cursor-pointer transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                </form>
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-2xl shadow-2xl border border-gray-100">
                        <Spinner className="w-12 h-12 text-[#458500] mb-4 animate-spin" />
                        <p className="text-base font-bold text-gray-800 tracking-wide">Authenticating...</p>
                        <p className="text-xs text-gray-500 mt-2">Please wait while we verify your credentials</p>
                    </div>
                </div>
            )}
        </div>
    );
}
