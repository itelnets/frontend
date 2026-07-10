"use client";

import { useState, useEffect } from 'react';

const slides = [
    {
        id: 1,
        title: "Vitamins",
        subtitle: "Everything from Vitamin A, B-Complex, D, K2 and more",
        gradient: "from-[#ffeeb8] via-[#ffd680] to-[#f4c45b]",
        items: [
            { name: "Vitamin D3+K2", color: "bg-yellow-100 text-yellow-600" },
            { name: "Liposomal Vitamin C", color: "bg-orange-100 text-orange-600" },
            { name: "B-Complex", color: "bg-red-100 text-red-600" }
        ]
    },
    {
        id: 2,
        title: "Sports Nutrition",
        subtitle: "Fuel your performance and recovery",
        gradient: "from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]",
        items: [
            { name: "Whey Protein", color: "bg-blue-100 text-blue-600" },
            { name: "Creatine", color: "bg-indigo-100 text-indigo-600" },
            { name: "Pre-Workout", color: "bg-purple-100 text-purple-600" }
        ]
    },
    {
        id: 3,
        title: "Beauty & Wellness",
        subtitle: "Glow from the inside out with premium supplements",
        gradient: "from-[#fce7f3] via-[#fbcfe8] to-[#f9a8d4]",
        items: [
            { name: "Collagen", color: "bg-pink-100 text-pink-600" },
            { name: "Biotin", color: "bg-rose-100 text-rose-600" },
            { name: "Hyaluronic Acid", color: "bg-fuchsia-100 text-fuchsia-600" }
        ]
    }
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const slide = slides[currentSlide];

    return (
        <div className={`relative w-full rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between p-6 md:p-8 min-h-[200px] md:min-h-[240px] transition-all duration-700 bg-gradient-to-r ${slide.gradient}`}>

            {/* Text Content */}
            <div className="z-10 max-w-lg mb-4 md:mb-0 transition-opacity duration-500">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1f2937] tracking-tight mb-2 leading-tight">
                    {slide.title}
                </h1>
                <p className="text-base md:text-xl font-bold text-[#1f2937] leading-snug">
                    {slide.subtitle}
                </p>
            </div>

            {/* Background decorative elements */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute left-1/2 bottom-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mb-32 pointer-events-none"></div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${currentSlide === idx ? 'bg-gray-800' : 'bg-gray-800/30 hover:bg-gray-800/50'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
