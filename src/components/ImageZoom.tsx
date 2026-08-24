"use client";

import { useState, useRef, MouseEvent, useEffect } from 'react';
import SharePopover from './SharePopover';
interface ImageZoomProps {
    src: string;
    alt: string;
    onHeartClick?: () => void;
    isHeartFilled?: boolean;
}

export default function ImageZoom({ src, alt, onHeartClick, isHeartFilled }: ImageZoomProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;

        const { left, top, width, height } = imageRef.current.getBoundingClientRect();

        // Calculate relative position (0 to 1)
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        setPosition({ x, y });
    };

    const [showShare, setShowShare] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    const shareContainerRef = useRef<HTMLDivElement>(null);

    // Get current URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    // Handle click outside to close share popover
    useEffect(() => {
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
                setShowShare(false);
            }
        };

        if (showShare) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShare]);

    return (
        <div className="relative aspect-square w-full sm:aspect-auto w-[340px] h-[340px] lg:w-[380px] lg:h-[380px] xl:w-[400px] xl:h-[400px] bg-white rounded-xl p-2 group mx-auto">
            {/* Main Image */}
            <div
                className="w-full h-full cursor-pointer relative"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Zoomed Portal Box (Appears on the right) */}
            {isZoomed && (
                <div
                    className="hidden lg:block absolute top-0 left-[calc(100%+5px)] xl:left-[calc(100%+40px)] w-[620px] h-[530px] xl:w-[910px] xl:h-[650px] bg-white border border-gray-200 shadow-2xl z-50 rounded-lg overflow-hidden bg-no-repeat"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
                        backgroundSize: '250%',
                    }}
                />
            )}

            {/* Action Buttons Overlay (Share & Heart) */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-10 items-end">
                <div onClick={onHeartClick} className={`w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm cursor-pointer transition-colors ${isHeartFilled ? 'border-green-600 text-green-600 bg-[#f0f7f4]' : 'border-gray-400 text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                    <svg className="w-6 h-6" fill={isHeartFilled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>

                <div className="relative" ref={shareContainerRef}>
                    <div onClick={() => setShowShare(!showShare)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-orange-200 shadow-sm text-orange-500 cursor-pointer pointer-events-auto hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </div>

                    {showShare && (
                        <SharePopover url={currentUrl} />
                    )}
                </div>
            </div>
        </div>
    );
}
