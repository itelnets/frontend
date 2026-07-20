'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { getProducts } from '@/services/product';
import ConfirmModal from '@/components/ConfirmModal';
import QuantityDropdown from '@/components/QuantityDropdown';
import ProductCard from '@/components/ProductCard';
import PageLoader from '@/components/PageLoader';

export default function CartPage() {
    const { cartItems, cartCount, removeFromCart, addToCart, updateQuantity, myLists, moveToCartFromList, moveToList, clearCart, removeFromList, savedForLater, saveForLater, moveToCartFromSaved, removeFromSaved, isCartLoading } = useCart();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [isRecsLoading, setIsRecsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'saved' | 'myLists'>('saved');
    const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'cart' | 'saved' | 'myList'; item: any } | null>(null);
    const [infoModal, setInfoModal] = useState<'shipping' | 'taxes' | 'rewards' | null>(null);

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
                setIsRecsLoading(true);
                const { data } = await getProducts();
                setRecommended(data.slice(0, 10)); // Take top 10 for carousel
            } catch (err) {
                console.error(err);
            } finally {
                setIsRecsLoading(false);
            }
        };
        fetchRecs();
    }, []);

    if (isCartLoading) {
        return <PageLoader />;
    }

    const RecommendedCarousel = () => (
        <div className="mt-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-6">Recommended for you</h2>
            <div className="relative">
                {isRecsLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-700 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 pb-4">
                        {recommended.length > 0 ? recommended.map((product: any) => (
                            <ProductCard key={product._id} product={product} />
                        )) : null}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="font-sans min-h-screen bg-white pb-12">
            <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 pt-6">

                {cartItems.length === 0 ? (
                    <div>
                        <div className="flex flex-col items-center justify-center text-center py-2 sm:py-8 md:py-10">
                            <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <svg className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Your shopping cart is empty</h1>

                            {!isLoggedIn && (
                                <>
                                    <p className="text-sm text-gray-600 mb-6">Sign in to enjoy exclusive discounts and deals</p>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                                        <Link href="/" className="px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-2.5 rounded-md border border-[#458500] text-[#458500] font-bold hover:bg-[#eef6e6] transition-colors">
                                            Start shopping
                                        </Link>
                                        <Link href="/login" className="px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-2.5 rounded-md bg-[#458500] hover:bg-[#366800] text-white font-bold transition-colors">
                                            Create Account
                                        </Link>
                                    </div>
                                </>
                            )}
                            {isLoggedIn && (
                                <div className="mb-8 mt-4">
                                    <Link href="/" className="px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-2.5 rounded-md border border-[#458500] text-[#458500] font-bold hover:bg-[#eef6e6] transition-colors">
                                        Start shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                        <RecommendedCarousel />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                            {/* LEFT COLUMN: Cart Items */}
                            <div className="flex-1 min-w-0">
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
                                        <div key={item.product?._id ? item.product._id : `cart-item-${index}`} className="flex gap-2 sm:gap-4 border-b border-gray-100 pb-6">
                                            <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 bg-white border border-gray-200 rounded p-1">
                                                {item.product.images && item.product.images.length > 0 ? (
                                                    <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${item.product.images[0]}`} alt={item.product.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <div className="flex flex-col gap-0.5 mb-1">
                                                    <Link href={`/products/${item.product._id}`} className="text-[11px] sm:text-[15px] text-[#333] leading-snug break-words font-medium">
                                                        {item.product.name}
                                                    </Link>
                                                    <div className="text-[11px] sm:text-base font-bold text-gray-900">
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
                                                        onChange={(qty) => updateQuantity(item.product._id, qty)}
                                                    />

                                                    <button onClick={() => setDeleteTarget({ type: 'cart', item })} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 text-gray-800 hover:text-black transition-colors cursor-pointer" title="Remove">
                                                        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>

                                                    <button onClick={() => saveForLater(item.product)} className="px-3 sm:px-4 py-[5px] sm:py-1.5 border border-gray-300 rounded-full text-[11px] sm:text-[13px] font-bold text-[#333] hover:bg-gray-50 transition-colors cursor-pointer">
                                                        Save for Later
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="hidden lg:block">
                                    <RecommendedCarousel />
                                </div>
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
                                    <div className="border border-gray-200 rounded-md p-4 sm:p-5 bg-white shadow-sm">
                                        <h3 className="font-bold text-gray-900 text-lg mb-3 sm:mb-4">Order summary</h3>

                                        <div className="space-y-3 border-b border-gray-200 pb-2 sm:pb-4 mb-2 sm:mb-4">
                                            <div className="flex justify-between text-sm sm:text-[15px]">
                                                <span className="text-gray-600">Items total ({cartCount})</span>
                                                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 -mt-2">Total weight: 0.06 kg</div>
                                        </div>

                                        <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                                            <div className="flex justify-between text-[13px] sm:text-[15px]">
                                                <span className="text-gray-800 font-bold">Subtotal</span>
                                                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 mb-1.5 sm:mb-2.5">
                                                <div className="flex justify-between text-[12px] sm:text-[14px]">
                                                    <span className="text-gray-600 flex items-center gap-1">Shipping <svg onClick={() => setInfoModal('shipping')} className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-gray-500 cursor-pointer hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                                    <span className="text-gray-900">₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-[12px] sm:text-[14px]">
                                                    <span className="text-gray-600 flex items-center gap-1">Taxes <svg onClick={() => setInfoModal('taxes')} className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-gray-500 cursor-pointer hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                                    <span className="text-gray-900">₹{duties.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between text-[12px] sm:text-[14px]">
                                                    <span className="text-gray-600 flex items-center gap-1">Rewards Credit <svg onClick={() => setInfoModal('rewards')} className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-gray-500 cursor-pointer hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                                    <span className="text-red-500 font-medium">₹0.00</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-[17px] sm:text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-[17px] sm:text-xl font-extrabold text-gray-900">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        <button onClick={() => {
                                            const userInfo = localStorage.getItem('userInfo');
                                            if (!userInfo) {
                                                toast.error('Please login first to proceed to checkout');
                                            } else {
                                                router.push('/checkout');
                                            }
                                        }} className="block text-center w-full bg-[#458500] hover:bg-[#366800] text-white font-normal py-2 sm:py-3 px-6 rounded-md transition-colors font-bold mb-2 sm:mb-4 sm:text-[15px] sm:text-[16px] cursor-pointer">
                                            Proceed to Checkout
                                        </button>

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
                        <div className="block lg:hidden">
                            <RecommendedCarousel />
                        </div>
                    </>
                )}

                {/* Save for later / My Lists Section */}
                <div className="my-4 sm:my-8 border-t border-gray-200">
                    <div className="flex border-b border-gray-200 gap-8">
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`py-2 sm:py-3 font-medium text-sm cursor-pointer ${activeTab === 'saved' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Save for Later
                        </button>
                        <button
                            onClick={() => setActiveTab('myLists')}
                            className={`py-2 sm:py-3 font-medium text-sm cursor-pointer ${activeTab === 'myLists' ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            My lists
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-6">
                        {(activeTab === 'saved' ? savedForLater : myLists).length === 0 ? (
                            <p className="text-gray-500 text-sm py-4">No items {activeTab === 'saved' ? 'saved for later' : 'in your lists'}.</p>
                        ) : (
                            (activeTab === 'saved' ? savedForLater : myLists).map((product, index) => (
                                <div key={product?._id ? product._id : `list-item-${index}`} className="w-[200px] group flex flex-col">
                                    <Link href={`/products/${product._id}`} className="block border border-gray-200 rounded p-4 mb-2 hover:shadow-sm">
                                        <div className="w-full aspect-square flex items-center justify-center relative bg-white">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} className="w-full h-full object-contain" />
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
                                        <button onClick={() => activeTab === 'saved' ? moveToCartFromSaved(product) : moveToCartFromList(product)} className="flex-1 bg-[#f89500] hover:bg-[#e08600] text-white text-[11px] sm:text-[13px] font-bold py-1 sm:py-1.5 rounded transition-colors shadow-sm cursor-pointer">
                                            Add to Cart
                                        </button>
                                        <button onClick={() => setDeleteTarget({ type: activeTab === 'saved' ? 'saved' : 'myList', item: product })} className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-gray-500 hover:text-black transition-colors cursor-pointer" title="Remove">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            <ConfirmModal
                isOpen={isRemoveAllModalOpen}
                title="Remove all items"
                description="Do you want to remove all items from your cart?"
                onCancel={() => setIsRemoveAllModalOpen(false)}
                onConfirm={() => {
                    clearCart();
                    setIsRemoveAllModalOpen(false);
                }}
                cancelText="Cancel"
                confirmText="Remove"
                isLoading={false}
            />

            <ConfirmModal
                isOpen={deleteTarget !== null}
                title="Remove item"
                description="Are you sure you want to remove this item?"
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) {
                        if (deleteTarget.type === 'cart') {
                            removeFromCart(deleteTarget.item.product._id);
                        } else if (deleteTarget.type === 'saved') {
                            removeFromSaved(deleteTarget.item);
                        } else if (deleteTarget.type === 'myList') {
                            removeFromList(deleteTarget.item._id);
                        }
                    }
                    setDeleteTarget(null);
                }}
                cancelText="Cancel"
                confirmText="Remove"
                isLoading={false}
            />

            {/* Info Modal */}
            {infoModal && (
                <div onClick={() => setInfoModal(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-4 sm:p-5 max-w-md w-full relative shadow-xl">
                        <button onClick={() => setInfoModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pr-6">
                            {infoModal === 'shipping' && 'Shipping Options'}
                            {infoModal === 'taxes' && 'Factors in Calculating Tax'}
                            {infoModal === 'rewards' && 'Rewards Credit'}
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-700 space-y-4">
                            {infoModal === 'shipping' && (
                                <p>We've selected the most cost-effective shipping option for your order. You can explore other shipping methods at checkout.</p>
                            )}
                            {infoModal === 'taxes' && (
                                <>
                                    <p>The amount of tax depends on a number of factors, such as:</p>
                                    <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
                                        <li>The delivery address of the order and possibly the point of shipping</li>
                                        <li>Whether the product(s) and shipping are taxable in that state</li>
                                        <li>The combined total of state, local, and use taxes</li>
                                    </ul>
                                </>
                            )}
                            {infoModal === 'rewards' && (
                                <>
                                    <p>Rewards earnings from making referrals will be in pending up to 35 days before becoming available for use. Any available Rewards Credit can be used towards your next purchase. Rewards Credit expires if there are no new Rewards activity (referrals or purchase) for 90 days.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
