'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Spinner from './Spinner';
import { getBanners, BannerItem } from '../services/banner';

const BG_CLASSES = [
    "from-[#fae6e9] via-[#f7d9dc] to-[#fce4e6]",
    "from-[#eef9f0] via-[#def2e3] to-[#e8f7ec]",
    "from-[#e0f2fe] via-[#bae6fd] to-[#e0f2fe]",
    "from-[#fef3c7] via-[#fde68a] to-[#fef3c7]",
    "from-[#f5f3ff] via-[#ede9fe] to-[#f5f3ff]"
];

export default function HeroCarousel() {
    const [banners, setBanners] = useState<BannerItem[] | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch uploaded banners from the database
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
        ? banners.map((b, idx) => ({
            id: b._id,
            imageUrl: b.imageUrl,
            tabTitle: b.tabTitle?.trim() || `Slide ${idx + 1}`,
            tabSubtitle: b.tabSubtitle?.trim() || '',
            bgClass: BG_CLASSES[idx % BG_CLASSES.length]
        }))
        : [];

    const totalSlides = activeSlides.length;

    // Ensure currentSlide is within bounds
    useEffect(() => {
        if (currentSlide >= totalSlides) {
            setCurrentSlide(0);
        }
    }, [totalSlides, currentSlide]);

    // Start auto scroll
    const startAutoPlay = () => {
        stopAutoPlay();
        if (!isPlaying || totalSlides === 0) return;
        autoPlayRef.current = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 5000);
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

    const handleTabHover = (index: number) => {
        setCurrentSlide(index);
        setIsHovered(true);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const hasBanners = Array.isArray(banners) && banners.length > 0;
    const currentBanner = (hasBanners && currentSlide < banners.length) ? banners[currentSlide] : undefined;
    const uploadedBanner = (currentBanner && currentBanner.imageUrl) ? currentBanner : undefined;
    const activeSlide = activeSlides[currentSlide];
    const isBannerLoading = banners === null;

    // Touch swipe support for mobile
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

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

    return (
        <div
            className="w-full relative select-none mb-2 sm:mb-10 md:mb-16"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Banner Main Body - true aspect ratio so it looks identical on all screen sizes */}
            <div
                className="w-full aspect-[1368/260] rounded-none overflow-hidden transition-all duration-500 relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >

                {/* Background: uploaded S3 image or fallback gradient */}
                {uploadedBanner ? (
                    <Image
                        src={uploadedBanner.imageUrl}
                        alt="Promotion Background"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover z-0"
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#fae6e9] via-[#f7d9dc] to-[#fce4e6] z-0" />
                )}

                {isBannerLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
                        <Spinner className="w-8 h-8 text-[#458500]" />
                    </div>
                )}

                {/* Navigation Arrows — hidden on mobile, visible on sm+ */}
                <button
                    onClick={prevSlide}
                    className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-white active:scale-95 transition-all z-20 cursor-pointer group drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                    aria-label="Previous slide"
                >
                    <svg className="w-8 h-8 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} className="group-hover:[stroke-width:4]" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-white active:scale-95 transition-all z-20 cursor-pointer group drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                    aria-label="Next slide"
                >
                    <svg className="w-8 h-8 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} className="group-hover:[stroke-width:4]" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Play/Pause Toggle — smaller on mobile */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute bottom-1 right-1 sm:bottom-3 sm:right-3 w-5 h-5 sm:w-10 sm:h-10 flex items-center justify-center text-white active:scale-95 transition-all z-20 cursor-pointer md:bottom-8 lg:bottom-10 group drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                    title={isPlaying ? "Pause autoplay" : "Start autoplay"}
                >
                    {isPlaying ? (
                        <svg className="w-3 h-3 sm:w-6 sm:h-6 transition-all group-hover:scale-125" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-3 h-3 sm:w-6 sm:h-6 transition-all group-hover:scale-125" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Mobile dot indicators */}
                <div className="flex sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 gap-1 z-20">
                    {activeSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1 rounded-full transition-all drop-shadow-sm cursor-pointer ${idx === currentSlide ? 'bg-white w-2' : 'bg-white/60 w-1'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Overlay Tabs - Centered, half on banner and half off banner */}
            <div className="hidden md:flex absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#f5f5f5] rounded-2xl shadow-lg border border-gray-200/80 p-1 z-30 items-stretch gap-1">
                {activeSlides.map((item, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                        <div
                            key={item.id}
                            onMouseEnter={() => handleTabHover(idx)}
                            className={`flex flex-col justify-center py-2.5 px-5 text-center cursor-pointer transition-all duration-300 rounded-xl whitespace-nowrap ${isActive
                                ? 'bg-white border border-gray-300 shadow-xs'
                                : 'bg-transparent border border-transparent hover:bg-white/40'
                                }`}
                        >
                            <div className={`text-[11px] lg:text-[12px] font-semibold leading-snug whitespace-nowrap ${isActive ? 'text-gray-900 font-bold' : 'text-gray-600'
                                }`}>
                                {item.tabTitle}
                            </div>
                            {item.tabSubtitle ? (
                                <div className={`text-[9px] lg:text-[10px] mt-0.5 font-bold ${isActive ? 'text-[#458500]' : 'text-gray-500'
                                    }`}>
                                    {item.tabSubtitle}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
