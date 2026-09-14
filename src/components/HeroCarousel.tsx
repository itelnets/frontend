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

    const [isMobileScreen, setIsMobileScreen] = useState(false);

    // Track responsive window screen width (< 400px vs >= 400px)
    useEffect(() => {
        const checkMobileScreen = () => {
            setIsMobileScreen(window.innerWidth < 400);
        };
        checkMobileScreen();
        window.addEventListener('resize', checkMobileScreen);
        return () => window.removeEventListener('resize', checkMobileScreen);
    }, []);

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

    const allActiveBanners = (Array.isArray(banners) && banners.length > 0)
        ? banners.filter(b => b.imageUrl)
        : [];

    // Filter banners based on screen width: < 400px -> mobile banners (400x150), >= 400px -> desktop banners (1368x260)
    const targetType = isMobileScreen ? 'mobile' : 'desktop';
    const filteredBanners = allActiveBanners.filter(b => {
        const widthVal = b.width || 0;
        const bannerDevice = b.deviceType || (widthVal > 0 && widthVal <= 600 ? 'mobile' : 'desktop');
        return bannerDevice === targetType;
    });

    // Fallback gracefully to all active banners if specific size banner isn't uploaded yet
    const activeSlides = filteredBanners.length > 0 ? filteredBanners : allActiveBanners;

    const totalSlides = activeSlides.length;

    // Reset slide index when activeSlides list changes
    useEffect(() => {
        setCurrentSlide(0);
    }, [isMobileScreen, totalSlides]);

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
        : (isMobileScreen ? '400 / 150' : '1368 / 260');

    const isBannerLoading = banners === null;
    if (isBannerLoading) {
        return (
            <div
                className="w-full overflow-hidden bg-gray-100 animate-pulse relative min-h-[120px]"
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
            {/* Banner Main Body - 400x150 aspect ratio on mobile (<400px), 1368x260 on desktop (>400px) */}
            <div
                className="w-full overflow-hidden relative bg-gray-100 min-h-[120px]"
                style={{ aspectRatio: bannerAspect }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {activeSlides.map((slide, idx) => (
                    <div
                        key={slide._id}
                        className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
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
            </div>
        </div>
    );
}
