'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialTab?: 'signin' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = 'signin' }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
    const router = useRouter();

    // Sign In State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordErrors, setShowPasswordErrors] = useState(false);

    // Register State
    const [name, setName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [regStep, setRegStep] = useState<'register' | 'verify'>('register');
    const [isRegLoading, setIsRegLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setIsForgotPassword(false);
            setRegStep('register');
            setShowPasswordErrors(false);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const handleLoginSubmit = async (e: React.FormEvent) => {
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

        const emailKey = email.toLowerCase().trim();
        const failedAttemptsKey = `failed_login_${emailKey}`;
        const lastFailedKey = `last_failed_${emailKey}`;

        let failedAttempts = parseInt(localStorage.getItem(failedAttemptsKey) || '0', 10);
        const lastFailedTime = parseInt(localStorage.getItem(lastFailedKey) || '0', 10);

        if (Date.now() - lastFailedTime >= 2 * 60 * 1000) {
            failedAttempts = 0;
            localStorage.removeItem(failedAttemptsKey);
            localStorage.removeItem(lastFailedKey);
        }

        if (failedAttempts >= 5) {
            toast.error('Too many requests for this email, try after 2 minutes');
            return;
        }

        if (isForgotPassword) {
            const lastSentStr = localStorage.getItem(`reset_sent_${email}`);
            if (lastSentStr && Date.now() - parseInt(lastSentStr, 10) < 2 * 60 * 1000) {
                toast.error('Link already sent. Try after 2 minutes');
                return;
            }

            setIsLoading(true);
            try {
                const { data } = await api.post('/auth/forgot-password', { email }, { timeout: 15000 });
                localStorage.setItem(`reset_sent_${email}`, Date.now().toString());

                localStorage.removeItem(failedAttemptsKey);
                localStorage.removeItem(lastFailedKey);

                await new Promise(resolve => setTimeout(resolve, 800));
                setIsLoading(false);
                toast.success(data.message);
                setIsForgotPassword(false);
            } catch (err: any) {
                if (err.response?.status === 401 || err.response?.status === 400 || err.response?.status === 404) {
                    const newAttempts = failedAttempts + 1;
                    localStorage.setItem(failedAttemptsKey, newAttempts.toString());
                    localStorage.setItem(lastFailedKey, Date.now().toString());
                } else if (err.response?.status === 429) {
                    localStorage.setItem(failedAttemptsKey, '5');
                    localStorage.setItem(lastFailedKey, Date.now().toString());
                }
                setIsLoading(false);
                toast.error(err.response?.data?.message || 'Failed to send reset link');
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.removeItem(failedAttemptsKey);
            localStorage.removeItem(lastFailedKey);

            if (data.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }

            await new Promise(resolve => setTimeout(resolve, 600));
            setIsLoading(false);

            sessionStorage.clear();
            localStorage.setItem('userInfo', JSON.stringify(data));
            document.cookie = "isLoggedIn=true; path=/; max-age=2592000";
            window.dispatchEvent(new Event('userInfoUpdated'));
            toast.success(data.message || 'Logged in successfully!');

            onClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed';

            if (err.response?.status === 401 || err.response?.status === 400 || err.response?.status === 404) {
                const newAttempts = failedAttempts + 1;
                localStorage.setItem(failedAttemptsKey, newAttempts.toString());
                localStorage.setItem(lastFailedKey, Date.now().toString());
            } else if (err.response?.status === 429) {
                localStorage.setItem(failedAttemptsKey, '5');
                localStorage.setItem(lastFailedKey, Date.now().toString());
            }

            setIsLoading(false);
            toast.error(errorMessage);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !regEmail || !mobileNumber || !regPassword) {
            toast.error('Please fill out all required fields');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|co\.in|edu|gov|io|co)$/i;
        if (!emailRegex.test(regEmail)) {
            toast.error('Invalid email format');
            return;
        }

        const fullMobileNumber = `+91${mobileNumber}`;

        const lastOtpSentStr = localStorage.getItem(`otp_sent_${regEmail}`);
        if (lastOtpSentStr) {
            const lastOtpSent = parseInt(lastOtpSentStr, 10);
            if (Date.now() - lastOtpSent < 2 * 60 * 1000) {
                toast.error('OTP already sent. Please try after 2 minutes');
                return;
            }
        }

        const emailKey = regEmail.toLowerCase().trim();
        const failedAttemptsKey = `failed_register_${emailKey}`;
        const lastFailedKey = `last_failed_reg_${emailKey}`;

        let failedAttempts = parseInt(localStorage.getItem(failedAttemptsKey) || '0', 10);
        const lastFailedTime = parseInt(localStorage.getItem(lastFailedKey) || '0', 10);

        if (Date.now() - lastFailedTime >= 2 * 60 * 1000) {
            failedAttempts = 0;
            localStorage.removeItem(failedAttemptsKey);
            localStorage.removeItem(lastFailedKey);
        }

        if (failedAttempts >= 5) {
            toast.error('Too many requests for this email, try after 2 minutes');
            return;
        }

        setIsRegLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email: regEmail, mobileNumber: fullMobileNumber, password: regPassword }, { timeout: 15000 });

            localStorage.setItem(`otp_sent_${regEmail}`, Date.now().toString());
            localStorage.removeItem(failedAttemptsKey);
            localStorage.removeItem(lastFailedKey);

            await new Promise(resolve => setTimeout(resolve, 600));
            setIsRegLoading(false);
            toast.success(data.message);
            setRegStep('verify');
        } catch (err: any) {
            if (err.response?.status === 400 || err.response?.status === 401 || err.response?.status === 404) {
                const newAttempts = failedAttempts + 1;
                localStorage.setItem(failedAttemptsKey, newAttempts.toString());
                localStorage.setItem(lastFailedKey, Date.now().toString());
            } else if (err.response?.status === 429) {
                localStorage.setItem(failedAttemptsKey, '5');
                localStorage.setItem(lastFailedKey, Date.now().toString());
            }

            const errorMessage = err.response?.data?.message || 'Registration failed';
            toast.error(errorMessage);
        } finally {
            setIsRegLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        setIsRegLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email: regEmail, otp });

            await new Promise(resolve => setTimeout(resolve, 600));
            toast.success(data.message);

            // Auto-login after successful verification if user credentials exist
            try {
                const loginRes = await api.post('/auth/login', { email: regEmail, password: regPassword });
                if (loginRes.data?.token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.token}`;
                }
                sessionStorage.clear();
                localStorage.setItem('userInfo', JSON.stringify(loginRes.data));
                document.cookie = "isLoggedIn=true; path=/; max-age=2592000";
                window.dispatchEvent(new Event('userInfoUpdated'));
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
                return;
            } catch {
                // If auto-login fails, switch to signin tab
                setActiveTab('signin');
                setEmail(regEmail);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Verification failed';
            toast.error(errorMessage);
        } finally {
            setIsRegLoading(false);
        }
    };

    const showRegPasswordErrors = regPassword.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[6px] sm:rounded-xl shadow-2xl border border-gray-100 p-5 sm:p-7 relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 bg-[#458500] hover:bg-[#366800] text-white transition-colors p-1.5 rounded-full cursor-pointer z-10 shadow-sm flex items-center justify-center"
                    aria-label="Close auth popup"
                >
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Tabs Header */}
                <div className="flex border-b border-gray-200 mb-4 pr-7 sm:pr-8">
                    <button
                        type="button"
                        onClick={() => { setActiveTab('signin'); setIsForgotPassword(false); }}
                        className={`flex-1 py-2.5 text-center text-[14px] sm:text-lg font-bold transition-all cursor-pointer ${activeTab === 'signin' ? 'text-[#458500] border-b-2 border-[#458500]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-2.5 text-center text-[14px] sm:text-lg font-bold transition-all cursor-pointer ${activeTab === 'register' ? 'text-[#458500] border-b-2 border-[#458500]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Create Account
                    </button>
                </div>

                {/* Subtitle */}
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                        {activeTab === 'signin'
                            ? (isForgotPassword ? 'Enter your email to receive a reset link' : 'Welcome back to Pratham Herbs')
                            : (regStep === 'verify' ? 'Enter the OTP sent to your email' : 'Create your Pratham Herbs account')}
                    </p>
                </div>

                {/* SIGN IN TAB CONTENT */}
                {activeTab === 'signin' && (
                    <form className="mt-4 space-y-4" onSubmit={handleLoginSubmit} noValidate>
                        <div className="space-y-3.5">
                            <div>
                                <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="auth-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-md border border-gray-300 placeholder-gray-400 focus:border-[#458500] focus:ring-[#458500] transition duration-200 outline-none text-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
                                <div>
                                    <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="auth-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-md border border-gray-300 placeholder-gray-400 focus:border-[#458500] focus:ring-[#458500] transition duration-200 outline-none text-sm pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#458500] hover:text-[#386c00] cursor-pointer focus:outline-none"
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
                                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                                        <span className={`transition-all duration-300 px-2 py-0.5 rounded border ${/[A-Z]/.test(password) ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && !/[A-Z]/.test(password) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Capital</span>
                                        <span className={`transition-all duration-300 px-2 py-0.5 rounded border ${/[a-z]/.test(password) ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && !/[a-z]/.test(password) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Lowercase</span>
                                        <span className={`transition-all duration-300 px-2 py-0.5 rounded border ${/[0-9]/.test(password) ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && !/[0-9]/.test(password) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Numeric</span>
                                        <span className={`transition-all duration-300 px-2 py-0.5 rounded border ${/[^A-Za-z0-9]/.test(password) && password.length > 0 ? 'opacity-100 border-[#458500] text-[#458500] bg-[#eef3ea]' : (showPasswordErrors && (!/[^A-Za-z0-9]/.test(password) || password.length === 0) ? 'opacity-100 border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Special</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isForgotPassword && (
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-xs font-medium text-[#458500] hover:text-[#3b7100] cursor-pointer transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#458500] hover:bg-[#3b7100] focus:outline-none cursor-pointer transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Spinner /> : (isForgotPassword ? 'Send Reset Link' : 'Sign In')}
                            </button>
                        </div>

                        {isForgotPassword && (
                            <div className="text-center text-xs text-gray-600 pt-1">
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
                )}

                {/* CREATE ACCOUNT TAB CONTENT */}
                {activeTab === 'register' && (
                    <form className="mt-4 space-y-3.5" onSubmit={regStep === 'register' ? handleRegisterSubmit : handleVerifyOtp} noValidate>
                        {regStep === 'register' ? (
                            <>
                                <div>
                                    <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        id="reg-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 placeholder-gray-400 focus:border-[#458500] focus:ring-[#458500] outline-none text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        required
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 placeholder-gray-400 focus:border-[#458500] focus:ring-[#458500] outline-none text-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="reg-mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                    <div className="mt-1 flex rounded-md border border-gray-300 overflow-hidden focus-within:border-[#458500]">
                                        <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-xs font-semibold border-r border-gray-200">+91</span>
                                        <input
                                            id="reg-mobile"
                                            type="tel"
                                            required
                                            maxLength={10}
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full px-3 py-2 outline-none text-sm"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="reg-password"
                                            type={showRegPassword ? "text" : "password"}
                                            required
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            className="block w-full px-3 py-2 rounded-md border border-gray-300 outline-none text-sm pr-10 focus:border-[#458500]"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#458500] cursor-pointer"
                                            onClick={() => setShowRegPassword(!showRegPassword)}
                                        >
                                            {showRegPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                                        <span className={`px-2 py-0.5 rounded border ${/[A-Z]/.test(regPassword) ? 'border-[#458500] text-[#458500] bg-[#eef3ea]' : (showRegPasswordErrors && !/[A-Z]/.test(regPassword) ? 'border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Capital</span>
                                        <span className={`px-2 py-0.5 rounded border ${/[a-z]/.test(regPassword) ? 'border-[#458500] text-[#458500] bg-[#eef3ea]' : (showRegPasswordErrors && !/[a-z]/.test(regPassword) ? 'border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Lowercase</span>
                                        <span className={`px-2 py-0.5 rounded border ${/[0-9]/.test(regPassword) ? 'border-[#458500] text-[#458500] bg-[#eef3ea]' : (showRegPasswordErrors && !/[0-9]/.test(regPassword) ? 'border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Numeric</span>
                                        <span className={`px-2 py-0.5 rounded border ${/[^A-Za-z0-9]/.test(regPassword) && regPassword.length > 0 ? 'border-[#458500] text-[#458500] bg-[#eef3ea]' : (showRegPasswordErrors && (!/[^A-Za-z0-9]/.test(regPassword) || regPassword.length === 0) ? 'border-red-500 text-red-700 bg-red-50' : 'opacity-40 border-gray-300 text-gray-500 bg-gray-50')}`}>Special</span>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <button
                                        type="submit"
                                        disabled={isRegLoading}
                                        className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#458500] hover:bg-[#3b7100] cursor-pointer transition duration-300 disabled:opacity-70"
                                    >
                                        {isRegLoading ? <Spinner /> : 'Create Account'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label htmlFor="reg-otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                                    <input
                                        id="reg-otp"
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2.5 rounded-md border border-gray-300 text-center font-bold tracking-widest text-lg outline-none focus:border-[#458500]"
                                        placeholder="123456"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isRegLoading}
                                        className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#458500] hover:bg-[#3b7100] cursor-pointer transition duration-300 disabled:opacity-70"
                                    >
                                        {isRegLoading ? <Spinner /> : 'Verify OTP'}
                                    </button>
                                </div>
                                <div className="text-center text-xs text-gray-600 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setRegStep('register')}
                                        className="font-medium text-[#458500] hover:text-[#3b7100] cursor-pointer"
                                    >
                                        Back to registration
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                )}
            </div>

            {/* Overlay loading indicator if submitting */}
            {(isLoading || isRegLoading) && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-xs rounded-2xl">
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-xl border border-gray-100">
                        <Spinner className="w-10 h-10 text-[#458500] mb-2 animate-spin" />
                        <p className="text-sm font-bold text-gray-800">Authenticating...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
