'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getBanners, BannerItem } from '../services/banner';

export default function HeroCarousel() {
    const [banners, setBanners] = useState<BannerItem[] | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    // Fetch uploaded banners from database
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await getBanners();
                setBanners(data);
            } catch (error) {
                console.error('Failed to load banners:', error);
                setBanners([]);
            }
        };
        fetchBanners();
    }, []);

    const activeSlides = (Array.isArray(banners) && banners.length > 0)
        ? banners.filter(b => b.imageUrl)
        : [];

    const totalSlides = activeSlides.length;

    // Ensure currentSlide is within bounds
    useEffect(() => {
        if (totalSlides > 0 && currentSlide >= totalSlides) {
            setCurrentSlide(0);
        }
    }, [totalSlides, currentSlide]);

    // Start auto scroll
    const startAutoPlay = () => {
        stopAutoPlay();
        if (!isPlaying || totalSlides <= 1) return;
        autoPlayRef.current = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 3000);
    };

    // Stop auto scroll
    const stopAutoPlay = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
    };

    // Control auto scroll based on hover and play/pause state
    useEffect(() => {
        if (!isHovered && isPlaying) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
        return () => stopAutoPlay();
    }, [isHovered, isPlaying, totalSlides]);

    const nextSlide = () => {
        if (totalSlides === 0) return;
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        if (totalSlides === 0) return;
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    // Touch swipe support for mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].screenX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    };

    // Dynamic aspect ratio calculation matching actual uploaded banner dimensions
    const firstSlide = activeSlides[0];
    const bannerAspect = (firstSlide && firstSlide.width && firstSlide.height && firstSlide.width > 0 && firstSlide.height > 0)
        ? `${firstSlide.width} / ${firstSlide.height}`
        : '1368 / 260';

    const isBannerLoading = banners === null;
    if (isBannerLoading) {
        return (
            <div
                className="w-full h-[180px] sm:h-auto bg-gray-100 animate-pulse relative overflow-hidden"
                style={{ aspectRatio: bannerAspect }}
            />
        );
    }

    if (totalSlides === 0) {
        return null;
    }

    return (
        <div
            className="w-full relative select-none group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Banner Main Body - Taller in Mobile View (h-[180px]), Desktop View Unchanged (aspectRatio) */}
            <div
                className="w-full h-[180px] sm:h-auto overflow-hidden relative bg-gray-100"
                style={{ aspectRatio: bannerAspect }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {activeSlides.map((slide, idx) => (
                    <div
                        key={slide._id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                        <Image
                            src={slide.imageUrl}
                            alt={`Banner ${idx + 1}`}
                            fill
                            priority={idx === 0}
                            sizes="100vw"
                            className="object-cover w-full h-full"
                        />
                    </div>
                ))}

                {/* Left and Right Navigation Buttons */}
                {totalSlides > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            aria-label="Previous slide"
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/75 hover:bg-white text-gray-800 p-1.5 sm:p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all flex items-center justify-center hover:scale-110 active:scale-95 focus:outline-none"
                        >
                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            aria-label="Next slide"
                            className="absolute right-2 sm:left-auto right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/75 hover:bg-white text-gray-800 p-1.5 sm:p-2.5 rounded-full shadow-md backdrop-blur-sm transition-all flex items-center justify-center hover:scale-110 active:scale-95 focus:outline-none"
                        >
                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
