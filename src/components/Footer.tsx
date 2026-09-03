'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#f8fafc] text-gray-700 font-sans border-t border-gray-200 mt-auto">
            {/* Value Proposition Badges */}
            <div className="border-b border-gray-200 bg-[#f1f5f9] py-2.5 sm:py-4 px-4">
                <div className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-full bg-[#458500]/15 flex items-center justify-center shrink-0 text-[#458500]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-gray-900 text-xs sm:text-sm font-semibold">100% Authentic</h4>
                            <p className="text-[11px] sm:text-xs text-gray-500">Directly sourced products</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-full bg-[#458500]/15 flex items-center justify-center shrink-0 text-[#458500]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-gray-900 text-xs sm:text-sm font-semibold">Fast Shipping</h4>
                            <p className="text-[11px] sm:text-xs text-gray-500">Delivered across India</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-full bg-[#458500]/15 flex items-center justify-center shrink-0 text-[#458500]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-gray-900 text-xs sm:text-sm font-semibold">Easy Returns</h4>
                            <p className="text-[11px] sm:text-xs text-gray-500">Hassle-free guarantee</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-2 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-full bg-[#458500]/15 flex items-center justify-center shrink-0 text-[#458500]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-gray-900 text-xs sm:text-sm font-semibold">Secure Payment</h4>
                            <p className="text-[11px] sm:text-xs text-gray-500">Protected by Razorpay</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-5 2xl:px-0 py-6 lg:py-8">
                <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap justify-between items-center sm:items-start gap-3 sm:gap-y-5 sm:gap-x-6 lg:gap-8 text-center sm:text-left">

                    {/* Brand Column */}
                    <div className="w-full sm:w-[46%] lg:w-[32%] xl:w-[25%] flex flex-col items-center sm:items-start space-y-3 text-center sm:text-left">
                        <Link href="/" className="inline-block">
                            <span className="text-[20px] sm:text-[22px] lg:text-[26px] 2xl:text-[28px] font-semibold text-gray-900 tracking-tight">
                                Pratham Herbs
                            </span>
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-[320px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-[340px] xl:max-w-sm text-center sm:text-left">
                            Your trusted destination for authentic Ayurvedic formulations, premium health supplements, organic wellness, and natural personal care products.
                        </p>
                    </div>

                    {/* Popular Categories */}
                    <div className="w-full sm:w-[46%] lg:w-auto space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h3 className="text-gray-900 text-[15px] sm:text-[16px] font-bold tracking-normal">Categories</h3>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <li>
                                <Link href="/type/supplements" className="hover:text-[#458500] transition-colors">
                                    Supplements
                                </Link>
                            </li>
                            <li>
                                <Link href="/type/sports" className="hover:text-[#458500] transition-colors">
                                    Sports Nutrition
                                </Link>
                            </li>
                            <li>
                                <Link href="/type/bath" className="hover:text-[#458500] transition-colors">
                                    Bath &amp; Personal Care
                                </Link>
                            </li>
                            <li>
                                <Link href="/type/beauty" className="hover:text-[#458500] transition-colors">
                                    Beauty &amp; Skincare
                                </Link>
                            </li>
                            <li>
                                <Link href="/type/grocery" className="hover:text-[#458500] transition-colors">
                                    Grocery &amp; Healthy Foods
                                </Link>
                            </li>
                            <li>
                                <Link href="/type/home" className="hover:text-[#458500] transition-colors">
                                    Home Essentials
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Navigation */}
                    <div className="w-full sm:w-[46%] lg:w-auto space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h3 className="text-gray-900 text-[15px] sm:text-[16px] font-bold tracking-normal">Quick Links</h3>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <li>
                                <Link href="/brands" className="hover:text-[#458500] transition-colors">
                                    Brands A-Z
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="hover:text-[#458500] transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="hover:text-[#458500] transition-colors">
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/myaccount" className="hover:text-[#458500] transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/checkout" className="hover:text-[#458500] transition-colors">
                                    Checkout
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div className="w-full sm:w-[46%] lg:w-[28%] space-y-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h3 className="text-gray-900 text-[15px] sm:text-[16px] font-bold tracking-normal">Support</h3>
                        <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <svg className="w-4 h-4 text-[#458500] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:care@prathamherbs.com" className="hover:text-[#458500] transition-colors font-medium">
                                    care@prathamherbs.com
                                </a>
                            </div>

                            <div className="flex items-start justify-center sm:justify-start gap-2">
                                <svg className="w-4 h-4 text-[#458500] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-center sm:text-left leading-relaxed w-fit sm:w-[260px]">
                                    121, Varni Plaza, Mota Varachha,<br className="inline sm:hidden" />
                                    &nbsp; Surat, Gujarat, India - 394101
                                </span>
                            </div>
                        </div>

                        <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <li>
                                <Link href="/user/myaccount" className="hover:text-[#458500] transition-colors">
                                    View My Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/privacy-policy" className="hover:text-[#458500] transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/terms-and-conditions" className="hover:text-[#458500] transition-colors">
                                    Terms &amp; Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Copyright & Security */}
            <div className="border-t border-gray-200 bg-[#e2e8f0]/40 py-4 px-4 text-xs text-gray-500">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p>© {new Date().getFullYear()} Pratham Herbs. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-gray-500 text-[11px] sm:text-xs">
                        <span>100% Encrypted &amp; Secure Checkout</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
