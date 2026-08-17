'use client';

import { useState, useEffect } from 'react';

export default function CookieConsentModal() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full z-[999] animate-in slide-in-from-bottom duration-500">
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl px-3.5 py-3.5 sm:px-8 sm:py-4 select-none">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 sm:gap-4 md:gap-8">
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 text-[#458500] mt-0.5 sm:mt-0">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                Cookie Consent
                            </h3>
                            <p className="text-[10.5px] sm:text-xs text-gray-600 mt-0.5 leading-snug">
                                We use cookies to improve your browsing experience, personalize content, analyze website traffic, and provide relevant services. By clicking <strong className="text-gray-800">“Accept All”</strong>, you consent to the use of all cookies.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto pt-0.5 md:pt-0">
                        <button
                            onClick={handleDecline}
                            className="flex-1 md:flex-none px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-center"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            className="flex-1 md:flex-none px-5 py-1.5 sm:px-6 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-[#458500] hover:bg-[#366800] rounded-lg shadow-xs transition-colors cursor-pointer text-center whitespace-nowrap"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
