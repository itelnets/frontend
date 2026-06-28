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
        <div className={`relative w-full rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between p-6 md:p-12 min-h-[280px] transition-all duration-700 bg-gradient-to-r ${slide.gradient}`}>
            
            {/* Text Content */}
            <div className="z-10 max-w-lg mb-4 md:mb-0 transition-opacity duration-500">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1f2937] tracking-tight mb-2 leading-tight">
                    {slide.title}
                </h1>
                <p className="text-base md:text-xl font-bold text-[#1f2937] leading-snug">
                    {slide.subtitle}
                </p>
            </div>

            {/* Images mimicking product bottles */}
            <div className="z-10 flex space-x-3 md:space-x-5">
                {slide.items.map((item, idx) => (
                    <div key={idx} className={`w-28 h-36 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center p-3 transition-transform cursor-pointer hover:scale-105 ${idx === 0 ? '-rotate-3' : idx === 1 ? 'rotate-2 z-10' : 'rotate-3'}`}>
                        <img src="/supplement_bottle.png" alt={item.name} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>

            {/* Background decorative elements */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute left-1/2 bottom-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mb-32"></div>

            {/* Carousel Controls */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-md text-gray-800 transition-colors z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-md text-gray-800 transition-colors z-20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
}
