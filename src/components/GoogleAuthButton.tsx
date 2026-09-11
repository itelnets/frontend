'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleAuthButtonProps {
    onSuccess?: () => void;
    buttonText?: string;
}

export default function GoogleAuthButton({ onSuccess, buttonText = "Sign in with Google" }: GoogleAuthButtonProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Google Profile State for Mobile Completion
    const [googleEmail, setGoogleEmail] = useState('');
    const [googleName, setGoogleName] = useState('');
    const [googleId, setGoogleId] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    const googleBtnContainerRef = useRef<HTMLDivElement>(null);
    const tokenClientRef = useRef<any>(null);

    const getClientId = (): string => {
        return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    };

    useEffect(() => {
        setMounted(true);

        const initGsi = () => {
            if (!window.google?.accounts) return;
            const clientId = getClientId();

            // 1. Initialize Google ID token client (renders invisible button over custom UI)
            if (window.google.accounts.id) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleCredentialResponse,
                        auto_select: false,
                    });

                    if (googleBtnContainerRef.current) {
                        googleBtnContainerRef.current.innerHTML = '';
                        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
                            type: 'standard',
                            theme: 'outline',
                            size: 'large',
                            width: 400,
                        });
                    }
                } catch (err) {
                    console.error('Google GIS ID Init Error:', err);
                }
            }

            // 2. Initialize Google OAuth2 token client (for direct click handling)
            if (window.google.accounts.oauth2) {
                try {
                    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: 'email profile openid',
                        callback: async (tokenResponse: any) => {
                            if (tokenResponse && tokenResponse.access_token) {
                                try {
                                    setIsLoading(true);
                                    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                                    });
                                    const userInfo = await res.json();
                                    if (userInfo && userInfo.email) {
                                        const gId = userInfo.sub || `google_${Date.now()}`;
                                        const name = userInfo.name || userInfo.given_name || userInfo.email.split('@')[0];
                                        await processGoogleAuth(userInfo.email, name, gId);
                                    }
                                } catch (err) {
                                    toast.error('Failed to retrieve Google profile info');
                                    setIsLoading(false);
                                }
                            }
                        },
                    });
                } catch (err) {
                    console.error('Google OAuth2 Token Client Init Error:', err);
                }
            }
        };

        if (window.google?.accounts) {
            initGsi();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGsi;
            document.body.appendChild(script);
        }
    }, []);

    const decodeJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    };

    const handleGoogleCredentialResponse = async (response: any) => {
        if (!response || !response.credential) return;

        const decoded = decodeJwt(response.credential);
        if (!decoded || !decoded.email) {
            toast.error('Failed to extract Google account information');
            return;
        }

        const gId = decoded.sub || `google_${Date.now()}`;
        const email = decoded.email;
        const name = decoded.name || decoded.given_name || email.split('@')[0];

        await processGoogleAuth(email, name, gId);
    };

    const processGoogleAuth = async (email: string, name: string, gId?: string) => {
        const normalizedEmail = email.toLowerCase().trim();
        const idToUse = gId || `google_${Date.now()}`;
        const nameToUse = name || normalizedEmail.split('@')[0];

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/google', {
                googleId: idToUse,
                email: normalizedEmail,
                name: nameToUse
            });

            if (data.requiresMobile) {
                setGoogleId(data.googleId || idToUse);
                setGoogleName(data.name || nameToUse);
                setGoogleEmail(data.email || normalizedEmail);
                setMobileNumber('');
                setIsMobileModalOpen(true);
            } else if (data.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                sessionStorage.clear();
                localStorage.setItem('userInfo', JSON.stringify(data));
                document.cookie = "isLoggedIn=true; path=/; max-age=2592000";
                window.dispatchEvent(new Event('userInfoUpdated'));
                toast.success(data.message || 'Login successfully!');

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push(data.role === 'admin' ? '/admin/users' : '/');
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Google authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuthClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setMobileNumber('');
        const clientId = getClientId();

        // 1. Try tokenClient first for explicit popup window trigger
        if (tokenClientRef.current) {
            try {
                tokenClientRef.current.requestAccessToken();
                return;
            } catch (err) {
                console.error('tokenClient error:', err);
            }
        }

        // 2. Try finding rendered GIS iframe button to click
        const btn = googleBtnContainerRef.current?.querySelector('div[role="button"]') as HTMLElement ||
            googleBtnContainerRef.current?.querySelector('iframe') as HTMLElement;
        if (btn) {
            btn.click();
            return;
        }

        // 3. Fallback: Open official Google OAuth popup window directly
        const redirectUri = window.location.origin;
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
        window.open(oauthUrl, 'google_oauth_popup', 'width=500,height=600,top=100,left=100');
    };

    const handleMobileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mobileNumber || mobileNumber.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        const fullMobileNumber = `+91${mobileNumber}`;

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/google-complete', {
                email: googleEmail,
                name: googleName,
                googleId,
                mobileNumber: fullMobileNumber
            });

            if (data.token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            sessionStorage.clear();
            localStorage.setItem('userInfo', JSON.stringify(data));
            document.cookie = "isLoggedIn=true; path=/; max-age=2592000";
            window.dispatchEvent(new Event('userInfoUpdated'));
            toast.success(data.message || 'Registered successfully!');

            setMobileNumber('');
            setIsMobileModalOpen(false);
            if (onSuccess) {
                onSuccess();
            } else {
                router.push(data.role === 'admin' ? '/admin/users' : '/');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to complete registration');
        } finally {
            setIsLoading(false);
        }
    };

    const closeMobileModal = () => {
        setMobileNumber('');
        setIsMobileModalOpen(false);
    };

    return (
        <>
            <div className="w-full">

                {/* Container with custom button UI & invisible GIS iframe overlay */}
                <div className="relative w-full overflow-hidden rounded-md">
                    {/* Custom Styled Google Sign In Button (Visual Layer) */}
                    <button
                        type="button"
                        onClick={handleGoogleAuthClick}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md shadow-xs bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none transition duration-200 cursor-pointer disabled:opacity-60"
                    >
                        {isLoading ? (
                            <Spinner className="w-5 h-5 text-gray-600 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                        )}
                        <span>{buttonText}</span>
                    </button>

                    {/* Transparent Overlay for GIS Rendered Button (captures clicks directly for GIS OAuth popup) */}
                    <div
                        ref={googleBtnContainerRef}
                        className="absolute inset-0 opacity-[0.001] z-10 cursor-pointer flex justify-center items-center overflow-hidden [&>div]:w-full [&>div]:h-full [&_iframe]:w-full! [&_iframe]:h-full! [&_iframe]:scale-150"
                    />
                </div>
            </div>

            {/* Mobile Number Completion Modal for Google Sign-In */}
            {mounted && isMobileModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-100 p-6 relative">
                        <button
                            type="button"
                            onClick={closeMobileModal}
                            className="absolute top-3.5 right-3.5 bg-[#458500] hover:bg-[#366800] text-white p-1.5 rounded-full cursor-pointer z-10 flex items-center justify-center"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-5">
                            <div className="w-12 h-12 mx-auto rounded-full bg-[#eef3ea] text-[#458500] flex items-center justify-center mb-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Add Your Mobile Number</h3>
                            <p className="text-xs text-gray-600 mt-1">Please provide your mobile number to complete registration with {googleEmail}</p>
                        </div>

                        <form onSubmit={handleMobileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Mobile Number
                                </label>
                                <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:border-[#458500] focus-within:ring-1 focus-within:ring-[#458500]">
                                    <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 text-sm font-semibold border-r border-gray-300">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="9876543210"
                                        className="w-full px-3 py-2.5 outline-none text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="block text-center w-full bg-[#458500] hover:bg-[#366800] text-white py-2 sm:py-2.5 px-6 rounded-md transition-colors font-normal text-[15px] sm:text-[16px] cursor-pointer disabled:opacity-100 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Spinner /> : 'Complete Registration'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

