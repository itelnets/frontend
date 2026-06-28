'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordErrors, setShowPasswordErrors] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing password reset token');
            router.push('/login');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowPasswordErrors(true);

        if (!newPassword || !confirmPassword) {
            toast.error('Please fill out all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password', { token, newPassword });
            toast.success(data.message);
            setNewPassword('');
            setConfirmPassword('');
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/login');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Password reset failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="flex flex-1 h-full bg-gray-50">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-green-900 relative items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/leaf.png')]"></div>
                <div className="z-10 text-center px-10">
                    <h1 className="text-5xl text-white mb-4 font-bold">Itelents</h1>
                    <p className="text-green-100 text-xl font-light">Revitalize your life with nature's wisdom.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center py-4 px-8 sm:p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Create New Password</h2>
                        <p className="mt-2 text-sm text-gray-600">Enter your new secure password below.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-green-500 transition duration-200 outline-none text-sm pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-600 hover:text-green-700 cursor-pointer focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[A-Z]/.test(newPassword) ? 'opacity-100 border-green-500 text-green-700 bg-green-50' : (showPasswordErrors && !/[A-Z]/.test(newPassword) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Capital</span>
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[a-z]/.test(newPassword) ? 'opacity-100 border-green-500 text-green-700 bg-green-50' : (showPasswordErrors && !/[a-z]/.test(newPassword) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Lowercase</span>
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[0-9]/.test(newPassword) ? 'opacity-100 border-green-500 text-green-700 bg-green-50' : (showPasswordErrors && !/[0-9]/.test(newPassword) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Numeric</span>
                                    <span className={`transition-all duration-300 px-2 py-1 rounded-md border ${/[^A-Za-z0-9]/.test(newPassword) && newPassword.length > 0 ? 'opacity-100 border-green-500 text-green-700 bg-green-50' : (showPasswordErrors && (!/[^A-Za-z0-9]/.test(newPassword) || newPassword.length === 0) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Special</span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-green-500 transition duration-200 outline-none text-sm pr-10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none cursor-pointer transition duration-300 transform disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Spinner /> : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-1 h-screen bg-gray-50 items-center justify-center">
                <Spinner />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
