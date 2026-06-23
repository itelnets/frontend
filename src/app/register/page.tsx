'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const fullMobileNumber = `+91${mobileNumber}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !mobileNumber || !password) {
            toast.error('Please fill out all required fields');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|co\.in|edu|gov|io|co)$/i;
        if (!emailRegex.test(email)) {
            toast.error('Invalid email format');
            return;
        }

        // Frontend validation: prevent API call if OTP was sent within the last 2 minutes
        const lastOtpSentStr = localStorage.getItem(`otp_sent_${email}`);
        if (lastOtpSentStr) {
            const lastOtpSent = parseInt(lastOtpSentStr, 10);
            if (Date.now() - lastOtpSent < 2 * 60 * 1000) {
                toast.error('OTP already sent. Please try after 2 minutes');
                return;
            }
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/register', { email, mobileNumber: fullMobileNumber, password });

            // Store the timestamp when the OTP was successfully sent
            localStorage.setItem(`otp_sent_${email}`, Date.now().toString());

            toast.success(data.message);
            setStep('verify');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });

            toast.success(data.message);
            router.push('/login');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Verification failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 h-full bg-gray-50">
            {/* Right Side - Image/Branding (Swapped for variety) */}
            <div className="hidden lg:flex lg:w-1/2 bg-green-800 relative items-center justify-center order-2">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="z-10 text-center px-10">
                    <h1 className="text-5xl font-serif text-white mb-4">Join Our Community</h1>
                    <p className="text-green-100 text-xl font-light">Start your journey to holistic wellness today.</p>
                </div>
            </div>

            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16 order-1">
                <div className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                            {step === 'register' ? 'Create Account' : 'Verify Email'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {step === 'register'
                                ? 'Fill in your details to get started'
                                : `Enter the OTP sent to ${email}`
                            }
                        </p>
                    </div>

                    {step === 'register' ? (
                        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSubmit} noValidate>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition duration-200 outline-none text-sm"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                                        Mobile Number
                                    </label>
                                    <div className="mt-1 flex rounded-lg border border-gray-300 focus-within:border-green-500 overflow-hidden transition duration-200">
                                        <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 text-sm font-medium border-r border-gray-300 select-none whitespace-nowrap">
                                            +91
                                        </span>
                                        <input
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            type="tel"
                                            autoComplete="tel"
                                            required
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full px-3 py-2 sm:py-3 placeholder-gray-400 outline-none text-sm bg-white"
                                            placeholder="9876543210"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition duration-200 outline-none text-sm pr-10"
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
                                </div>


                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none cursor-pointer transition duration-300 transform disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Spinner /> : 'Register'}
                                </button>
                            </div>

                            <div className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-green-700 hover:text-green-600 transition">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleVerify} noValidate>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                        Enter OTP
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="block w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:border-green-500 focus:ring-green-500 transition duration-200 outline-none text-lg sm:text-xl tracking-widest text-center"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none cursor-pointer transition duration-300 transform disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Spinner /> : 'Verify & Register'}
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep('register')}
                                    className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                                >
                                    Back to Registration
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
