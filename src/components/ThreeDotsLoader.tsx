'use client';

import React from 'react';

interface ThreeDotsLoaderProps {
    className?: string;
}

export function ThreeDotsLoader({ className = '' }: ThreeDotsLoaderProps) {
    return (
        <div className={`flex items-center justify-center py-6 w-full ${className}`}>
            <style jsx>{`
                @keyframes dot1Travel {
                    0% {
                        transform: translateX(-160px) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    40%, 70% {
                        transform: translateX(48px) scale(1.25);
                        opacity: 1;
                    }
                    85% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(160px) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes dot2Travel {
                    0% {
                        transform: translateX(-160px) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    40%, 70% {
                        transform: translateX(0px) scale(1.25);
                        opacity: 1;
                    }
                    85% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(160px) scale(0.5);
                        opacity: 0;
                    }
                }

                @keyframes dot3Travel {
                    0% {
                        transform: translateX(-160px) scale(0.5);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    40%, 70% {
                        transform: translateX(-48px) scale(1.25);
                        opacity: 1;
                    }
                    85% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(160px) scale(0.5);
                        opacity: 0;
                    }
                }
            `}</style>

            <div className="relative h-8 w-72 flex items-center justify-center overflow-hidden">
                {/* 1. Green Dot 1 */}
                <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-[#458500] shadow-2xs opacity-0"
                    style={{
                        animation: 'dot1Travel 2.0s infinite cubic-bezier(0.4, 0, 0.2, 1) both',
                        animationDelay: '0s',
                    }}
                />
                {/* 2. Green Dot 2 */}
                <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-[#458500] shadow-2xs opacity-0"
                    style={{
                        animation: 'dot2Travel 2.0s infinite cubic-bezier(0.4, 0, 0.2, 1) both',
                        animationDelay: '0.2s',
                    }}
                />
                {/* 3. Green Dot 3 */}
                <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-[#458500] shadow-2xs opacity-0"
                    style={{
                        animation: 'dot3Travel 2.0s infinite cubic-bezier(0.4, 0, 0.2, 1) both',
                        animationDelay: '0.4s',
                    }}
                />
            </div>
        </div>
    );
}

export default ThreeDotsLoader;
