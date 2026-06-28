"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ImageZoom from '@/components/ImageZoom';
import CustomerReviews from '@/components/CustomerReviews';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(90);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [showReviewsPopover, setShowReviewsPopover] = useState(false);

    const mockProduct = {
        name: "California Gold Nutrition, Omega 800 Ultra-Concentrated Omega-3 Fish Oil, kd-pur Triglyceride Form, 90 Fish Gelatin Softgels (1,000 mg per Softgel)",
        brand: "California Gold Nutrition",
        rating: 4.8,
        reviews: "133,759",
        price30: 1012.28,
        price90: 2621.96,
        inStock: true,
        soldRecently: "60,000+",
        images: [
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png",
            "/supplement_bottle.png"
        ]
    };

    const currentPrice = selectedPackage === 90 ? mockProduct.price90 : mockProduct.price30;

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 500);
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    const renderReviewsPopover = () => (
        <div className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-5 cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-extrabold text-gray-900">4.8</div>
                <div className="flex flex-col">
                    <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-500">Based on {mockProduct.reviews} ratings</span>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                {[
                    { star: 5, pct: 87, w: 'w-[87%]', color: 'bg-green-700' },
                    { star: 4, pct: 10, w: 'w-[10%]', color: 'bg-green-600' },
                    { star: 3, pct: 2, w: 'w-[2%]', color: 'bg-green-400' },
                    { star: 2, pct: 0, w: 'w-[0%]', color: 'bg-gray-200' },
                    { star: 1, pct: 0, w: 'w-[0%]', color: 'bg-gray-200' },
                ].map((row) => (
                    <div key={row.star} className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex text-yellow-400 w-16">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < row.star ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${row.color} ${row.w}`}></div>
                        </div>
                        <div className="w-6 text-right text-[10px]">{row.pct}%</div>
                    </div>
                ))}
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    Review highlights
                    <svg className="w-3.5 h-3.5 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Heart health
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Feeling better
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Premium option
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Smooth and pliable
                    </span>
                    <span className="flex items-center gap-1.5 bg-red-50 text-red-800 text-xs px-2.5 py-1.5 rounded-full border border-red-200 hover:bg-red-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Fishy after taste
                    </span>
                </div>
            </div>

            <div className="text-center">
                <Link href="#" className="text-blue-600 hover:underline text-xs font-bold flex items-center justify-center gap-1">
                    See customer reviews
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>
        </div>
    );

    const renderTitleAndRating = () => (
        <div className="mb-4 lg:mb-6">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Itelents Brands</span>
                <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Best seller</span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-2">
                {mockProduct.name}
            </h1>

            <div className="text-sm text-gray-600 mb-2">
                By <Link href="#" className="text-blue-600 hover:underline">{mockProduct.brand}</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm lg:border-b lg:border-gray-100 lg:pb-4">

                {/* Rating with Popover */}
                <div
                    className="flex items-center gap-1 relative cursor-pointer"
                    onMouseEnter={() => setShowReviewsPopover(true)}
                    onMouseLeave={() => setShowReviewsPopover(false)}
                >
                    <span className="font-bold text-gray-700 hover:underline">{mockProduct.rating}</span>
                    <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                    </div>
                    <span className="text-blue-600 hover:underline cursor-pointer">{mockProduct.reviews}</span>
                    <svg className="w-3.5 h-3.5 text-gray-500 hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>

                    {showReviewsPopover && renderReviewsPopover()}
                </div>

                <span className="text-gray-300 hidden lg:inline">|</span>
                <div className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span>204 Q&A</span>
                </div>
            </div>
        </div>
    );

    const renderImageGallery = () => (
        <div className="w-full flex flex-col">
            <div className="mb-2 lg:mb-4">
                <ImageZoom src={mockProduct.images[selectedImageIdx]} alt={mockProduct.name} />
            </div>
            <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
                {mockProduct.images.map((img, idx) => (
                    <div key={idx} onClick={() => setSelectedImageIdx(idx)} className={`aspect-square rounded-md border-2 p-1 cursor-pointer transition-colors ${idx === selectedImageIdx ? 'border-green-600' : 'border-transparent hover:border-gray-300'}`}>
                        <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCartBox = () => (
        <div className="w-full space-y-4">
            <div className="border border-gray-200 rounded-xl p-3 lg:p-5 shadow-sm bg-white">
                <div className="flex flex-col lg:flex-row lg:items-baseline gap-1 lg:gap-2 mb-4 lg:mb-6">
                    <span className="text-xl lg:text-2xl font-extrabold text-gray-900">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[10px] lg:text-xs text-gray-500">₹{(currentPrice / selectedPackage).toFixed(2)}/serving</span>
                </div>

                <div className="flex items-center justify-between border border-gray-300 rounded-md p-1.5 lg:p-2 mb-3 lg:mb-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="font-bold text-gray-900 text-sm lg:text-base">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <button onClick={() => toast.success('Added to cart successfully!')} className="w-full bg-[#f38700] hover:bg-[#e07b00] text-white font-bold py-2.5 lg:py-3.5 rounded-md transition-colors shadow-sm mb-3 lg:mb-4 text-sm lg:text-base">
                    Add to Cart
                </button>

                <button className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 lg:py-2.5 rounded-md transition-colors text-[11px] lg:text-sm">
                    <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Add to Lists
                </button>
            </div>

            <div className="bg-[#f0f7f4] border border-[#e2efe9] rounded-xl p-3 lg:p-5">
                <div className="flex items-center gap-1.5 lg:gap-2 mb-1 lg:mb-2 font-bold text-green-800 text-xs lg:text-sm">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Quality Promise
                </div>
                <p className="text-[10px] lg:text-xs text-gray-700 mb-1 leading-tight">
                    This product is guaranteed authentic and backed by our easy returns & refunds policy.
                </p>
                <a href="#" className="text-[10px] lg:text-xs text-blue-600 hover:underline">Details</a>
            </div>

            <div className="border border-gray-200 rounded-xl p-3 lg:p-5 shadow-sm bg-white">
                <div className="flex justify-center gap-2 mb-2">
                    <div className="w-12 h-16 border rounded p-1"><img src="/supplement_bottle.png" className="w-full h-full object-contain" /></div>
                    <div className="flex items-center text-gray-400 text-xs">+</div>
                    <div className="w-12 h-16 border rounded p-1"><img src="/supplement_bottle.png" className="w-full h-full object-contain" /></div>
                </div>
                <div className="text-[10px] text-gray-800 font-bold mb-1">Combo with:</div>
                <a href="#" className="text-[10px] text-blue-600 hover:underline leading-tight block mb-2">California Gold Nutrition, Vitamin D3, 50 mcg</a>
                <p className="text-[9px] text-gray-500 mb-3 bg-gray-50 p-1.5 rounded">Since Vitamin D is fat-soluble, taking it with Omega-3 may enhance absorption...</p>

                <div className="text-center font-bold text-sm text-gray-900 mb-2">Combo price: ₹3,093.44</div>
                <button className="w-full bg-[#f38700] hover:bg-[#e07b00] text-white font-bold py-1.5 rounded-md text-[11px] transition-colors">
                    Add Both to Cart
                </button>
            </div>
        </div>
    );

    const renderProductDetailsBottom = () => (
        <div className="w-full flex flex-col pt-4 lg:pt-0">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs lg:text-sm font-bold text-green-700">In stock</span>
                <span className="text-[10px] lg:text-xs font-medium text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {mockProduct.soldRecently} sold in 30 days
                </span>
            </div>

            <div className="mb-4 lg:mb-6">
                <div className="text-xs lg:text-sm font-bold text-gray-800 mb-2">Package quantity: <span className="font-normal text-gray-600">{selectedPackage} count</span></div>
                <div className="flex gap-2 lg:gap-3">
                    <button
                        onClick={() => setSelectedPackage(30)}
                        className={`flex flex-col items-center justify-center p-2 lg:p-3 rounded-md border-2 transition-colors w-20 lg:w-24 ${selectedPackage === 30 ? 'border-green-700 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <span className="text-[10px] lg:text-xs text-gray-500 mb-0.5 lg:mb-1">30 count</span>
                        <span className="text-xs lg:text-sm font-bold text-gray-900">₹1,012.28</span>
                    </button>
                    <button
                        onClick={() => setSelectedPackage(90)}
                        className={`flex flex-col items-center justify-center p-2 lg:p-3 rounded-md border-2 transition-colors w-20 lg:w-24 ${selectedPackage === 90 ? 'border-green-700 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <span className="text-[10px] lg:text-xs text-gray-500 mb-0.5 lg:mb-1">90 count</span>
                        <span className="text-xs lg:text-sm font-bold text-gray-900">₹2,621.96</span>
                    </button>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-3 lg:p-4 flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50">
                <span className="font-bold text-gray-800 text-[11px] lg:text-sm">Advanced Omega Support Bundle</span>
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 lg:p-6 mb-8 lg:mb-0">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                    <div className="bg-blue-600 p-1 lg:p-1.5 rounded text-white">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm lg:text-lg">AI overview</h3>
                </div>
                <p className="text-[10px] lg:text-xs text-gray-500 mb-3 lg:mb-4">AI generated. Not medical advice.</p>

                <div className="space-y-3 lg:space-y-4 text-[11px] lg:text-sm">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-0.5 lg:mb-1">What it's for</h4>
                        <p className="text-gray-700">Cardiovascular health; Balanced inflammatory response; General wellness</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-0.5 lg:mb-1">Who it may fit</h4>
                        <p className="text-gray-700 leading-snug">Adults who eat little fatty fish and those seeking a simple once-daily omega-3 option for everyday wellness.</p>
                    </div>
                </div>
            </div>

            {/* Key info section */}
            <div className="space-y-6 lg:space-y-8 mt-6 lg:mt-8 text-sm lg:text-base">
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Key info</h3>
                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <div className="text-gray-500 text-xs lg:text-sm mb-0.5">Serving size</div>
                            <div className="font-bold text-gray-900 text-sm lg:text-base">1 softgel</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs lg:text-sm mb-0.5">Total servings</div>
                            <div className="font-bold text-gray-900 text-sm lg:text-base">90</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs lg:text-sm mb-0.5">Best by</div>
                            <div className="font-bold text-gray-900 text-sm lg:text-base">01/2029</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Certifications and diet</h3>
                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <span className="text-gray-900 text-sm lg:text-base">Halal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-gray-900 text-sm lg:text-base">Gluten-free</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Quality standards & manufacturing</h3>
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-orange-500 mb-1.5 lg:mb-2 text-sm lg:text-base">Product rankings:</h3>
                    <ul className="text-xs lg:text-sm space-y-1 text-gray-900 font-bold">
                        <li>#1 in <span className="text-blue-600 font-normal hover:underline cursor-pointer">Omegas & Fish Oils (EPA DHA)</span></li>
                        <li>#1 in <span className="text-blue-600 font-normal hover:underline cursor-pointer">Gut Health</span></li>
                        <li>#1 in <span className="text-blue-600 font-normal hover:underline cursor-pointer">Omega-3 Fish Oil</span></li>
                        <li>#1 in <span className="text-blue-600 font-normal hover:underline cursor-pointer">Brain & Cognitive</span></li>
                        <li>#1 in <span className="text-blue-600 font-normal hover:underline cursor-pointer">kd-pur® Omegas</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderFrequentlyPurchased = () => {
        const products = [
            { name: "California Gold Nutrition, Vitamin D3 + K2 as MK-7, 100 Veggie Capsules", price: "₹1,581.38", reviews: "32,949", rating: 4.8 },
            { name: "Doctor's Best, High Absorption Magnesium Lysinate Glycinate, Chelated, Albion® TRAACS®", price: "₹2,227.20", reviews: "205,546", rating: 4.9 },
            { name: "California Gold Nutrition, LactoBif® 30 Probiotics, 30 Billion CFU, 60 Veggie Capsules", price: "₹2,181.71", reviews: "166,206", rating: 4.8 },
            { name: "NOW Foods, Magnesium Glycinate, 180 Tablets (100 mg per Tablet)", price: "₹2,182.42", reviews: "38,475", rating: 4.7 },
            { name: "Life Extension, BioActive Complete B-Complex, 60 Vegetarian Capsules", price: "₹1,072.21", reviews: "111,195", rating: 4.8 },
        ];

        return (
            <div className="w-full mt-10 lg:mt-16 mb-8 border-t border-gray-200 pt-8 lg:pt-12">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 px-2 lg:px-0">Frequently purchased together</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 lg:px-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {products.map((prod, i) => (
                        <div key={i} className="min-w-[140px] max-w-[140px] lg:min-w-[160px] lg:max-w-[160px] flex flex-col cursor-pointer group">
                            <div className="aspect-square bg-white p-2 mb-2 lg:mb-3 flex items-center justify-center relative overflow-hidden transition-colors">
                                <img src="/supplement_bottle.png" className="h-[80%] object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <div className="text-[10px] lg:text-[11px] text-gray-800 hover:underline mb-1 line-clamp-3 leading-snug">
                                {prod.name}
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, j) => (
                                        <svg key={j} className="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <span className="text-[9px] lg:text-[10px] text-gray-500">{prod.reviews}</span>
                            </div>
                            <div className="font-bold text-gray-900 text-xs lg:text-sm">{prod.price}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderProductInformation = () => (
        <div className="w-full mb-12">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 bg-gray-50 p-3 lg:p-4 rounded-md">Product information</h2>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-2 lg:px-4">
                {/* Left Col: Overview */}
                <div className="w-full lg:w-[60%]">
                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Overview</h3>
                    <ul className="list-disc pl-4 lg:pl-5 space-y-1.5 text-xs lg:text-sm text-gray-800 mb-6 lg:mb-8">
                        <li><span className="italic">California Gold Nutrition®</span> Omega 800 Ultra-Concentrated Omega-3 Fish Oil</li>
                        <li>Featuring KD-Pür® Concentrated Fish Oil Processed in Germany</li>
                        <li>Preferred Triglyceride Form with 480 mg EPA and 320 mg DHA</li>
                        <li>Helps Support Cardiovascular Health*</li>
                        <li>May Help Support a Healthy Inflammatory Response*</li>
                        <li>Formulated without Gluten, GMOs</li>
                        <li>Produced in a 3rd Party Audited cGMP Registered (Certified) Facility</li>
                        <li>100% Gold Guarantee</li>
                    </ul>

                    <p className="text-xs lg:text-sm text-gray-700 leading-relaxed mb-4">
                        Fish oil is a popular daily supplement due to its high level of omega-3 fatty acids, which are considered good fats that can contribute to cardiovascular health. <span className="italic">California Gold Nutrition</span> <strong>Omega 800 Ultra-Concentrated Omega-3 Fish Oil</strong> is a convenient daily supplement that makes it easy to add more omega-3s to your diet, as it is specifically designed for individuals looking for an ultra-concentrated, once-daily softgel.
                    </p>
                    <p className="text-xs lg:text-sm text-gray-700 leading-relaxed mb-4">
                        <strong>Fish Oil and Cardiovascular Health</strong><br />
                        EPA and DHA are two omega-3s found within fish oil that are deemed "good fats" due to their many potential health benefits. Our <strong>Omega 800</strong> offers the highest quality fish oil, with no less than 80% of EPA/DHA, for the best overall value. Adding a fish oil rich in these healthy fats to your daily routine may help to promote the health of the heart and overall cardiovascular system.* In addition, fish oil and omega-3s may help to support a healthy inflammatory response.*
                    </p>
                    <p className="text-xs lg:text-sm text-gray-700 leading-relaxed mb-6 lg:mb-8">
                        <span className="italic">California Gold Nutrition</span> <strong>Omega 800 Ultra-Concentrated Omega-3 Fish Oil</strong> features KD-Pür® IFOS™ quality fish oil that is purified and processed in Germany to the highest industry standards. This premium fish oil is contained within fish gelatin softgels that are manufactured in California, USA.
                    </p>

                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Specifications</h3>
                    <ul className="list-disc pl-4 lg:pl-5 space-y-1.5 text-xs lg:text-sm text-gray-800 mb-6 lg:mb-8">
                        <li>First available: 04/2017</li>
                        <li>Shipping weight: 0.22 kg <svg className="w-3.5 h-3.5 inline text-gray-500 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></li>
                        <li>Product code: CGN-01102</li>
                        <li>UPC: 898220011025</li>
                        <li>Package quantity: 120 count</li>
                        <li>Dimensions: 12.8 x 6.5 x 6.4 cm, 0.22 kg</li>
                        <li className="list-none -ml-4 lg:-ml-5 mt-2">
                        </li>
                    </ul>

                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Suggested use</h3>
                    <p className="text-xs lg:text-sm text-gray-800 leading-relaxed mb-6 lg:mb-8">
                        Take 1 softgel daily, with food. Best when taken as directed by a qualified healthcare professional.
                    </p>

                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Other ingredients</h3>
                    <div className="text-xs lg:text-sm text-gray-800 space-y-4 mb-6 lg:mb-8">
                        <div>
                            <span className="font-bold block mb-1">Main Ingredients</span>
                            Krill Oil Concentrate
                        </div>
                        <div>
                            <span className="font-bold block mb-1">Other Ingredients</span>
                            Fish Gelatin Softgel (Gelatin, Purified Water, Vegetable Glycerin, Sorbitol) and Natural Flavors.
                        </div>
                        <div className="font-bold">
                            Contains: Crustacean Shellfish (Krill) and Fish (Tilapia)
                        </div>
                        <p className="italic text-gray-600 leading-relaxed">
                            Not manufactured with milk, eggs, tree nuts, peanuts, wheat, soy, sesame, or gluten. Produced in an FDA registered, third-party audited, and cGMP-compliant facility that may process other products that contain these allergens or ingredients.
                        </p>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Warnings</h3>
                    <div className="text-xs lg:text-sm text-gray-800 space-y-4 mb-6 lg:mb-8 leading-relaxed">
                        <p><strong>Keep out of reach of children.</strong> Pregnant or lactating women, the chronically ill, elderly, individuals under the age of 18, those taking prescription medications (e.g., blood thinners) as well as those with a physician-diagnosed medical condition should consult with a physician, pharmacist, naturopath or other qualified healthcare professional prior to taking dietary supplements.</p>
                        <p><strong>Sealed for your protection. Do not use if seal is missing or broken. Store in a cool, dry place. Protect from heat, light, and moisture.</strong></p>
                        <p><strong>Note:</strong> Natural flavor added to help mask natural krill oil aroma.</p>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Disclaimer</h3>
                    <div className="text-xs lg:text-sm text-gray-800 space-y-4 mb-6 lg:mb-8 leading-relaxed">
                        <p>While Itelents strives to ensure the accuracy of its product images and information, some manufacturing changes to packaging and/or ingredients may be pending update on our site. Although items may occasionally ship with alternate packaging, freshness is always guaranteed. We recommend that you read labels, warnings and directions of all products before use and not rely solely on the information provided by Itelents.</p>
                    </div>
                </div>

                {/* Right Col: Supplement facts */}
                <div className="w-full lg:w-[40%]">
                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Supplement facts</h3>
                    <div className="border border-gray-300 bg-white">
                        <div className="p-3 lg:p-4 border-b border-gray-300">
                            <div className="text-xs lg:text-sm font-bold mb-1">Serving Size: 1 Softgel</div>
                            <div className="text-xs lg:text-sm font-bold">Servings Per Container: 90</div>
                        </div>

                        <div className="p-3 lg:p-4">
                            <table className="w-full text-xs lg:text-sm">
                                <thead>
                                    <tr className="border-b-4 border-gray-900">
                                        <th className="text-left font-bold py-1.5 lg:py-2"></th>
                                        <th className="text-right font-bold py-1.5 lg:py-2 w-20 lg:w-24 leading-tight align-bottom">Amount Per Serving</th>
                                        <th className="text-right font-bold py-1.5 lg:py-2 w-16 lg:w-20 leading-tight align-bottom">%Daily Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2.5">Calories</td>
                                        <td className="text-right py-2.5">10</td>
                                        <td className="text-right py-2.5"></td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2.5">Total Fat</td>
                                        <td className="text-right py-2.5">1 g</td>
                                        <td className="text-right py-2.5">1%*</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2.5">Cholesterol</td>
                                        <td className="text-right py-2.5">10 mg</td>
                                        <td className="text-right py-2.5">3%</td>
                                    </tr>
                                    <tr className="border-b-4 border-gray-900">
                                        <td className="py-2.5">Omega-3 Fish Oil Concentrate</td>
                                        <td className="text-right py-2.5">1 g (1,000 mg)</td>
                                        <td className="text-right py-2.5">†</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2.5 pl-3 text-gray-600">Total Omega-3 Fatty Acids</td>
                                        <td className="text-right py-2.5">840 mg</td>
                                        <td className="text-right py-2.5">†</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2.5 pl-3 text-gray-600">Eicosapentaenoic Acid (EPA as TG)</td>
                                        <td className="text-right py-2.5">480 mg</td>
                                        <td className="text-right py-2.5">†</td>
                                    </tr>
                                    <tr className="border-b-4 border-gray-900">
                                        <td className="py-2.5 pl-3 text-gray-600">Docosahexaenoic Acid (DHA as TG)</td>
                                        <td className="text-right py-2.5">320 mg</td>
                                        <td className="text-right py-2.5">†</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="text-[10px] lg:text-xs text-gray-600 mt-3 leading-relaxed">
                                *Percent Daily Values are based on a 2,000 calorie diet.<br />
                                †Daily Value not established.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 py-2 lg:py-3 text-[10px] lg:text-xs text-gray-500 flex flex-col gap-0.5 lg:gap-1">
                    <div className="flex flex-wrap items-center gap-1">
                        <Link href="#" className="hover:underline whitespace-nowrap">Brands A-Z</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline text-gray-800 whitespace-nowrap">{mockProduct.brand}</Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                        <Link href="#" className="hover:underline whitespace-nowrap">Categories</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline whitespace-nowrap">Supplements</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline whitespace-nowrap">Omegas & Fish Oils (EPA DHA)</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline whitespace-nowrap">Omega-3 Fish Oil</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 py-4 lg:py-8">

                {/* --- MOBILE LAYOUT (hidden on desktop) --- */}
                <div className="flex flex-col lg:hidden gap-6">
                    {renderTitleAndRating()}
                    {renderImageGallery()}
                    {renderProductDetailsBottom()}
                    {renderCartBox()}
                </div>

                {/* --- DESKTOP LAYOUT (hidden on mobile) --- */}
                <div className="hidden lg:flex flex-row gap-8">
                    <div className="w-[35%] relative z-50">
                        <div className="sticky top-32 z-50">
                            {renderImageGallery()}
                        </div>
                    </div>
                    <div className="w-[40%] flex flex-col relative z-10">
                        {renderTitleAndRating()}
                        {renderProductDetailsBottom()}
                    </div>
                    <div className="w-[25%] relative z-10">
                        <div className="sticky top-28 z-10">
                            {renderCartBox()}
                        </div>
                    </div>
                </div>

                {/* NEW SECTIONS: Appended to both mobile & desktop layouts */}
                {renderFrequentlyPurchased()}
                {renderProductInformation()}
                <CustomerReviews productId={params.id as string} />

            </div>
        </div>
    );
}
