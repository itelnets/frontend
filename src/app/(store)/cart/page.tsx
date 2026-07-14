'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getProducts } from '@/services/product';
import AddToCartButton from '@/components/AddToCartButton';
import QuantityDropdown from '@/components/QuantityDropdown';

export default function CartPage() {
    const { cartItems, cartCount, removeFromCart, addToCart, myLists, moveToCartFromList, moveToList, clearCart, removeFromList } = useCart();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'saved' | 'myLists'>('myLists');
    const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false);

    // Estimated delivery date: 7-12 days from today
    const getDeliveryDateRange = () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 7);
        const end = new Date(today);
        end.setDate(today.getDate() + 12);
        const fmt = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        return `${fmt(start)} – ${fmt(end)}`;
    };

    // Total calculation
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price) * item.quantity, 0);
    const shipping = 0; // Mock
    const duties = 0; // Mock
    const total = subtotal + (cartItems.length > 0 ? shipping + duties : 0);

    useEffect(() => {
        // Check Auth
        const userInfo = localStorage.getItem('userInfo');
        setIsLoggedIn(!!userInfo);

        // Fetch recommendations
        const fetchRecs = async () => {
            try {
                const { data } = await getProducts();
                setRecommended(data.slice(0, 10)); // Take top 10 for carousel
            } catch (err) {
                console.error(err);
            }
        };
        fetchRecs();
    }, []);

    const updateQuantity = (product: any, newQty: number, currentQty: number) => {
        if (newQty === 0) {
            removeFromCart(product._id);
            return;
        }
        if (newQty < 1) return;
        const diff = newQty - currentQty;
        addToCart(product, diff);
    };

    const RecommendedCarousel = () => (
        <div className="mt-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-6">Recommended for you</h2>
            <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 pb-4">
                    {recommended.length > 0 ? recommended.map((product: any) => (
                        <Link href={`/products/${product._id}`} key={product._id} className="bg-white rounded-md flex flex-col cursor-pointer hover:shadow-lg transition-shadow group border border-gray-300 overflow-hidden w-full">
                            <div className="w-full aspect-[6/5] flex items-center justify-center relative bg-white border-b border-gray-100 p-2.5 sm:p-4">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                ) : (
                                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                )}
                                <AddToCartButton product={product} />
                            </div>
                            <div className="p-2.5 sm:p-3 flex-1 flex flex-col relative">
                                <div className="text-[13px] text-gray-800 line-clamp-3 leading-snug mb-2 flex-1 font-medium group-hover:text-blue-700 transition-colors">
                                    {product.name}
                                </div>
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-auto">
                                    <div className="text-lg font-bold text-gray-900">
                                        <span className="text-sm font-medium relative -top-0.5 pr-0.5">₹</span>{product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}
                                    </div>
                                    {product.discount > 0 && (
                                        <>
                                            <div className="text-xs text-gray-500 line-through">₹{product.price}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="text-gray-500 py-8 text-sm">Loading recommendations...</div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="font-sans min-h-screen bg-white pb-12">
            <div className="max-w-[1400px] mx-auto px-4 pt-6">

                {cartItems.length === 0 ? (
                    <div>
                        <div className="flex flex-col items-center justify-center text-center py-12">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your shopping cart is empty</h1>

                            {!isLoggedIn && (
                                <>
                                    <p className="text-sm text-gray-600 mb-6">Sign in to enjoy exclusive discounts and deals</p>
                                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                        <Link href="/" className="px-6 py-2.5 rounded-md border border-[#458500] text-[#458500] font-bold hover:bg-[#eef6e6] transition-colors">
                                            Start shopping
                                        </Link>
                                        <Link href="/login" className="px-6 py-2.5 rounded-md bg-[#458500] hover:bg-[#366800] text-white font-bold transition-colors">
                                            Sign In / Create Account
                                        </Link>
                                    </div>
                                </>
                            )}
                            {isLoggedIn && (
                                <div className="mb-8 mt-4">
                                    <Link href="/" className="px-6 py-2.5 rounded-md border border-[#458500] text-[#458500] font-bold hover:bg-[#eef6e6] transition-colors">
                                        Start shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                        <RecommendedCarousel />
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                        {/* LEFT COLUMN: Cart Items */}
                        <div className="flex-1 min-w-0">
                            {/* Blue Info Alert */}
                            <div className="bg-[#eef6fa] border border-[#d2eaf7] rounded-md p-4 flex gap-3 mb-6">
                                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                <div className="text-sm text-gray-700">
                                    Special note: Per India Customs, all customers ordering internationally are required to complete KYC documents for customs clearance. The shipping information must be an exact match to the consignee's name and residential address on the KYC document... <span className="font-bold underline cursor-pointer">Show More</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-gray-200 pb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        Cart ({cartCount})
                                    </h1>
                                    <span className="text-[12px] font-normal text-gray-600 bg-gray-100 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-gray-200">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Ship to India &gt;
                                    </span>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 text-sm font-bold text-gray-600 w-full md:w-auto">
                                    <button onClick={() => setIsRemoveAllModalOpen(true)} className="flex items-center gap-1 hover:text-black cursor-pointer">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Remove all
                                    </button>
                                    <button className="flex items-center gap-1 hover:text-black text-orange-500 cursor-pointer">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                        Share
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items List */}
                            <div className="space-y-6">
                                {cartItems.map((item, index) => (
                                    <div key={item.product?._id ? item.product._id : `cart-item-${index}`} className="flex gap-3 sm:gap-4 border-b border-gray-100 pb-6">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 border border-gray-200 rounded p-1">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${item.product.images[0]}`} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4 mb-1">
                                                <Link href={`/products/${item.product._id}`} className="text-sm sm:text-[15px] text-[#333] leading-snug flex-1 break-words font-medium">
                                                    {item.product.name}
                                                </Link>
                                                <div className="text-base sm:text-lg font-bold text-gray-900 shrink-0">
                                                    ₹{((item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <div className="text-[11px] sm:text-[12px] text-gray-500 mb-1.5">180 count &gt;</div>
                                            <div className="text-[11px] sm:text-[12px] text-gray-500 mb-4 flex items-center gap-1">
                                                <span className="w-1 h-1 bg-gray-500 rounded-full inline-block"></span>
                                                Product code: {item.product?._id ? item.product._id.substring(0, 8).toUpperCase() : 'N/A'}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-auto">
                                                {/* Quantity Dropdown */}
                                                <QuantityDropdown
                                                    value={item.quantity}
                                                    onChange={(qty) => updateQuantity(item.product, qty, item.quantity)}
                                                />

                                                <button onClick={() => removeFromCart(item.product._id)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 text-gray-500 hover:text-black transition-colors cursor-pointer" title="Remove">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>

                                                <button onClick={() => moveToList(item.product)} className="px-3 sm:px-4 py-1.5 border border-gray-300 rounded-full text-[12px] sm:text-[13px] font-bold text-[#333] hover:bg-gray-50 transition-colors cursor-pointer">
                                                    Save for later
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <RecommendedCarousel />
                        </div>

                        {/* RIGHT COLUMN: Order Summary */}
                        <div className="w-full lg:w-[380px] shrink-0">
                            <div className="lg:sticky lg:top-[120px] space-y-4">

                                {/* Promo Code */}
                                <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-3">Promo code</h3>
                                    <div className="flex gap-2 mb-1">
                                        <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-green-600" />
                                        <button className="px-5 py-1.5 border border-[#458500] text-[#458500] font-bold rounded text-sm hover:bg-[#eef6e6] transition-colors">Apply</button>
                                    </div>
                                    <div className="text-[12px] text-gray-500">One code per order</div>
                                </div>

                                {/* Order Summary Totals */}
                                <div className="border border-gray-200 rounded-md p-5 bg-white shadow-sm">
                                    <h3 className="font-bold text-gray-900 text-lg mb-4">Order summary</h3>

                                    <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Items total ({cartCount})</span>
                                            <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 -mt-2">Total weight: 0.06 kg</div>
                                    </div>

                                    <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-gray-800 font-bold">Subtotal</span>
                                            <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-gray-600 flex items-center gap-1">Shipping <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                            <span className="text-gray-900">₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-gray-600 flex items-center gap-1">Duties & Taxes <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                            <span className="text-gray-900">₹{duties.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-[13px]">
                                            <span className="text-gray-600 flex items-center gap-1">Rewards Credit <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                            <span className="text-red-500 font-medium">₹0.00</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-extrabold text-gray-900">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <Link href="/checkout" className="block text-center w-full bg-[#458500] hover:bg-[#366800] text-white font-normal py-3 px-6 rounded-md transition-colors font-bold mb-4 text-[16px] cursor-pointer">
                                        Proceed to Checkout
                                    </Link>

                                    <div className="text-center text-[11px] text-gray-700 font-medium">
                                        Estimated delivery date {getDeliveryDateRange()}
                                    </div>
                                </div>

                                {/* Accepted Payments */}
                                <div className="text-center">
                                    <div className="text-[11px] font-bold text-gray-700 mb-2">Accepted payment methods</div>
                                    <div className="flex flex-wrap justify-center gap-2 opacity-80">
                                        {/* Mock icons for payments */}
                                        <div className="w-8 h-5 bg-blue-100 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-blue-800">VISA</div>
                                        <div className="w-8 h-5 bg-red-50 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-red-600">MC</div>
                                        <div className="w-8 h-5 bg-blue-50 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-blue-500">AMEX</div>
                                        <div className="w-8 h-5 bg-blue-50 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-blue-700">UPI</div>
                                        <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-800">GPay</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save for later / My Lists Section */}
                <div className="mt-12 border-t border-gray-200 pt-8 mb-8">
                    <div className="flex border-b border-gray-200 gap-8">
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`pb-3 font-medium text-sm ${activeTab === 'saved' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Save for later
                        </button>
                        <button
                            onClick={() => setActiveTab('myLists')}
                            className={`pb-3 font-medium text-sm ${activeTab === 'myLists' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            My lists
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-6">
                        {myLists.length === 0 ? (
                            <p className="text-gray-500 text-sm py-4">No items saved.</p>
                        ) : (
                            myLists.map((product, index) => (
                                <div key={product?._id ? product._id : `mylist-item-${index}`} className="w-[200px] group flex flex-col">
                                    <Link href={`/products/${product._id}`} className="block border border-gray-200 rounded p-4 mb-2 hover:shadow-sm">
                                        <div className="w-full aspect-square flex items-center justify-center relative bg-white">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 rounded"></div>
                                            )}
                                        </div>
                                    </Link>
                                    <Link href={`/products/${product._id}`} className="text-xs text-gray-800 line-clamp-3 mb-1 hover:text-blue-600 leading-snug">
                                        {product.name}
                                    </Link>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-gray-500">(12076)</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 mb-2 mt-auto">
                                        ₹{product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => moveToCartFromList(product)} className="flex-1 bg-[#f89500] hover:bg-[#e08600] text-white text-[13px] font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer">
                                            Add to Cart
                                        </button>
                                        <button onClick={() => removeFromList(product._id)} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-500 hover:text-black transition-colors cursor-pointer" title="Remove">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {isRemoveAllModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded p-6 w-[90%] max-w-[400px] shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Remove all items</h3>
                            <button onClick={() => setIsRemoveAllModalOpen(false)} className="text-gray-500 hover:text-gray-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 mb-6">Do you want to remove all items from your cart?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsRemoveAllModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-sm">
                                Cancel
                            </button>
                            <button onClick={() => { clearCart(); setIsRemoveAllModalOpen(false); }} className="flex-1 py-2 bg-[#d14b45] hover:bg-[#b03f39] text-white font-bold rounded transition-colors cursor-pointer text-sm">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
