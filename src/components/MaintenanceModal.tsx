'use client';
import React, { useEffect, useState } from 'react';

export default function MaintenanceModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const pingServer = async (showLoader = false) => {
        if (showLoader) setIsChecking(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) return;
            const healthUrl = `${apiUrl.replace(/\/+$/, '')}/health`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(healthUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res && (res.ok || res.status === 200)) {
                window.location.reload();
            }
        } catch (e) {
            // Still down
        } finally {
            if (showLoader) setIsChecking(false);
        }
    };

    useEffect(() => {
        const handleMaintenance = () => {
            setIsOpen(true);
        };
        window.addEventListener('server-maintenance', handleMaintenance);
        return () => window.removeEventListener('server-maintenance', handleMaintenance);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen) {
            // Automatically ping the server every 5 seconds without showing loader
            interval = setInterval(() => {
                pingServer(false);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-full shadow-2xl p-4 sm:p-6 w-full max-w-[320px] sm:max-w-[400px] aspect-square flex flex-col items-center justify-center text-center animate-fade-in-up">
                <div className="max-w-[90%] sm:max-w-[85%] flex flex-col items-center">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#458500] mx-auto mb-2 sm:mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h2 className="text-base sm:text-xl font-extrabold text-gray-900 mb-1.5 sm:mb-2">Under Maintenance</h2>
                    <p className="text-[10px] sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-tight sm:leading-snug">
                        We're currently performing scheduled maintenance or our servers are temporarily unreachable. Please try again soon.
                    </p>
                    <button
                        onClick={() => pingServer(true)}
                        disabled={isChecking}
                        className="w-full max-w-[160px] sm:max-w-[200px] cursor-pointer bg-[#458500] hover:bg-[#366800] text-white font-bold py-2 sm:py-2.5 px-4 sm:px-6 rounded-full transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                        {isChecking ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Checking
                            </>
                        ) : (
                            "Try Again"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
