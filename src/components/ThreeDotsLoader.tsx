'use client';

import React from 'react';

interface LoaderProps {
    className?: string;
    size?: number | string;
}

export function ThreeDotsLoader({ className = '' }: LoaderProps) {
    return (
        <div className={`flex flex-col items-center justify-center w-full min-h-[calc(100vh-220px)] sm:min-h-[480px] py-8 ${className}`}>
            <style jsx>{`
                @keyframes coinFlip {
                    0% {
                        transform: perspective(600px) rotateY(0deg);
                    }
                    50% {
                        transform: perspective(600px) rotateY(180deg);
                    }
                    100% {
                        transform: perspective(600px) rotateY(360deg);
                    }
                }
            `}</style>
            <div className="relative flex flex-col items-center justify-center">
                <div
                    className="flex items-center justify-center"
                    style={{
                        animation: 'coinFlip 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                        transformStyle: 'preserve-3d',
                        willChange: 'transform',
                    }}
                >
                    <img
                        src="/brand-logo.png"
                        alt="Loading..."
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain select-none pointer-events-none mix-blend-multiply"
                    />
                </div>
            </div>
        </div>
    );
}

export const BrandLogoLoader = ThreeDotsLoader;
export default ThreeDotsLoader;
