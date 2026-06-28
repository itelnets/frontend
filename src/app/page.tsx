import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="w-full flex-1 mb-20">
                {/* Hero Banner Section */}
                <div className="max-w-[1400px] mx-auto px-4 mt-6">
                    <HeroCarousel />
                </div>

                {/* Sub-categories row */}
                <div className="max-w-[1200px] mx-auto px-4 mt-6 hidden md:block">
                    <div className="flex justify-between items-center bg-white border border-gray-100 rounded-xl shadow-sm p-1">
                        <div className="flex-1 text-center py-3 px-2 border-r border-gray-100 hover:bg-gray-50 cursor-pointer rounded-l-xl transition-colors">
                            <div className="text-sm font-semibold text-gray-700">Buy One, Get One 80% Off</div>
                            <div className="text-xs text-gray-500">Shop Now</div>
                        </div>
                        <div className="flex-1 text-center py-3 px-2 border-r border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="text-sm font-semibold text-gray-700">Travel Essentials</div>
                            <div className="text-xs text-gray-500">Shop Now</div>
                        </div>
                        <div className="flex-1 text-center py-3 px-2 border border-green-200 border-b-4 border-b-[#458500] rounded-md shadow-sm relative -top-1 bg-white cursor-pointer z-10">
                            <div className="text-sm font-bold text-gray-900">Vitamins</div>
                            <div className="text-xs font-bold text-[#458500]">Shop Now</div>
                        </div>
                        <div className="flex-1 text-center py-3 px-2 border-r border-l border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="text-sm font-semibold text-gray-700">Sunscreen</div>
                            <div className="text-xs text-gray-500">BOGO 50% Off</div>
                        </div>
                        <div className="flex-1 text-center py-3 px-2 border-r border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="text-sm font-semibold text-gray-700">Professional Brands</div>
                            <div className="text-xs text-gray-500">Earn 10% Credit</div>
                        </div>
                        <div className="flex-1 text-center py-3 px-2 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="text-sm font-semibold text-gray-700">Probiotics For Travel</div>
                            <div className="text-xs text-gray-500">Learn More</div>
                        </div>
                        <div className="px-6 py-3 cursor-pointer hover:underline text-blue-600 font-semibold text-sm">
                            View all &gt;
                        </div>
                    </div>
                </div>

                {/* Login Prompt Section */}
                <div className="max-w-[1400px] mx-auto px-4 mt-16 mb-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-b border-gray-200 py-6">
                        <div className="text-lg font-bold text-gray-800 mb-4 sm:mb-0">
                            Get a more personalized
                        </div>
                        <Link href="/login" className="px-8 py-3 bg-[#458500] hover:bg-[#3b7100] text-white font-bold rounded-md shadow-sm transition-colors cursor-pointer text-sm">
                            Sign In or Create Account
                        </Link>
                    </div>
                </div>

                {/* Deals Section */}
                <div className="max-w-[1400px] mx-auto px-4 mt-8">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
                    </div>

                    <div className="relative">
                        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                            {[
                                { title: "California Gold Nutrition, Omega 800 Ultra-Concentrated Omega-3", reviews: "133,754", price: "₹2,621.96" },
                                { title: "California Gold Nutrition, Omega-3 Premium Fish Oil, 100 Fish Gelatin Softgels", reviews: "486,581", price: "₹1,190.91" },
                                { title: "NOW Foods, Vitamin D-3, High Potency, 125 mcg (5,000 IU), 120 Softgels", reviews: "274,467", price: "₹742.00" },
                                { title: "NOW Foods, Omega-3 Fish Oil, 1,000 mg, 180 EPA - 120 DHA, 100 Softgels", reviews: "173,433", price: "₹923.37" },
                                { title: "NOW Foods, Vitamin D3 & K2, 120 Capsules", reviews: "77,565", price: "₹1,003.80" },
                                { title: "California Gold Nutrition, Vitamin D3, 125 mcg (5,000 IU), 90 Fish Gelatin", reviews: "321,051", price: "₹561.10" }
                            ].map((product, idx) => (
                                <Link href="/products/1" key={idx} className="min-w-[200px] w-[220px] bg-white rounded-xl p-3 flex flex-col cursor-pointer hover:shadow-lg transition-shadow group">
                                    <div className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                                        <img src="/supplement_bottle.png" alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="text-[13px] text-gray-800 line-clamp-3 leading-snug mb-2 flex-1">
                                        {product.title}
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">{product.reviews}</span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 mt-auto">{product.price}</div>
                                </Link>
                            ))}
                        </div>

                        {/* Carousel Arrows */}
                        <div className="absolute left-0 top-[40%] -translate-y-1/2 -ml-4 w-10 h-10 bg-white border border-gray-200 hover:shadow-md rounded-full flex items-center justify-center cursor-pointer shadow-sm text-gray-600 transition-all z-10 hidden md:flex">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </div>
                        <div className="absolute right-0 top-[40%] -translate-y-1/2 -mr-4 w-10 h-10 bg-white border border-gray-200 hover:shadow-md rounded-full flex items-center justify-center cursor-pointer shadow-sm text-gray-600 transition-all z-10 hidden md:flex">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
