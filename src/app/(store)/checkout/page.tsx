'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { fetchAddresses, addAddress, updateAddress, removeAddress } from '@/services/addressService';
import ConfirmModal from '@/components/ConfirmModal';
import toast from 'react-hot-toast';
import PaymentMethod from '@/components/PaymentMethod';
import AddressSection from '@/components/AddressSection';
// import { useRazorpayPayment } from './useRazorpayPayment';
import { useCashfreePayment } from './useCashfreePayment';
import { getDoctorStatus } from '@/services/doctor';
import PromoCodeSection from '@/components/PromoCodeSection';


function CheckoutContent() {
    const { cartItems, cartCount, updateQuantity, removeFromCart, moveToList, clearCart, appliedPromo, setAppliedPromo } = useCart();
    const [showErrors, setShowErrors] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [showAddressLine2, setShowAddressLine2] = useState(false);
    const [showLandmark, setShowLandmark] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddressMode, setSelectedAddressMode] = useState('new'); // address _id or 'new'
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [showCardError, setShowCardError] = useState(false);
    const [showGPayButton, setShowGPayButton] = useState(false);
    const [isProcessingGPay, setIsProcessingGPay] = useState(false); // Used to hide the credit card option
    const [isPreparingGPay, setIsPreparingGPay] = useState(false); // Used for the loading spinner on the green button
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null); // address _id or 'new'
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [cartItemToDelete, setCartItemToDelete] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        isDefault: false
    });
    const [userEmail, setUserEmail] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [infoModal, setInfoModal] = useState<string | null>(null);

    // Promo Code States
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [promoError, setPromoError] = useState('');
    const [doctorPromo, setDoctorPromo] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutStep = searchParams.get('step') === '2' ? 2 : 1;

    // Fetch addresses on mount
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            router.push('/login');
            return;
        }

        try {
            const parsed = JSON.parse(userInfo);
            setUserEmail(parsed.email || '');
            setUserName(parsed.name || '');
        } catch (e) {
            console.error("Error parsing user info:", e);
        }

        const loadAddresses = async () => {
            try {
                const data = await fetchAddresses();
                const sortedData = data.sort((a: any, b: any) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
                setSavedAddresses(sortedData);
                if (data.length > 0) {
                    const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
                    setSelectedAddressMode(defaultAddr._id);
                } else {
                    setSelectedAddressMode('new');
                }
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        loadAddresses();

        try {
            const parsed = JSON.parse(userInfo);
            const userObj = parsed.user || parsed;
            if (userObj.isDoctorVerified || userObj.doctorPromoCode) {
                setDoctorPromo(userObj.doctorPromoCode);
            } else {
                getDoctorStatus()
                    .then(res => {
                        if (res?.doctorRequest?.status === 'approved') {
                            setDoctorPromo(res.doctorRequest.promoCode);
                        }
                    })
                    .catch(() => { });
            }
        } catch (e) {
            getDoctorStatus()
                .then(res => {
                    if (res?.doctorRequest?.status === 'approved' && res?.doctorRequest?.promoCode) {
                        setDoctorPromo(res.doctorRequest.promoCode);
                    }
                })
                .catch(() => { });
        }

    }, [router]);

    const handleGPayProcess = () => {
        handleCashfreePayment();
    };

    // Total calculation
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price) * item.quantity, 0);
    const promoDiscountAmount = appliedPromo ? Math.round(subtotal * (appliedPromo.discountPercent / 100)) : 0;
    const discountedSubtotal = Math.max(0, subtotal - promoDiscountAmount);
    const shipping = cartItems.length === 0 ? 0 : (discountedSubtotal > 1000 ? 0 : 99);
    const taxes = discountedSubtotal * 0.05; // 5% taxes
    const total = discountedSubtotal + (cartItems.length > 0 ? shipping + taxes : 0);

    const handleApplyPromoCode = async (codeToApply?: string) => {
        const targetCode = (codeToApply || promoCodeInput).trim().toUpperCase();
        setPromoError('');

        if (!targetCode) {
            setPromoError('Please enter a promo code');
            return;
        }

        try {
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const res = await fetch(`${apiUrl}/promo/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ code: targetCode })
            });

            const data = await res.json();
            if (!res.ok || !data.valid) {
                const errMsg = data.message || 'Invalid or expired promo code';
                setPromoError(errMsg);
                toast.error(errMsg);
                return;
            }

            const appliedObj = { code: data.code, discountPercent: data.discountPercent };
            setAppliedPromo(appliedObj);
            setPromoCodeInput(data.code);
            toast.success(data.message || `Promo Code ${data.code} applied (${data.discountPercent}% OFF)!`);
        } catch (err: any) {
            console.error('Promo verification error:', err);
            const errMsg = 'Invalid or expired promo code';
            setPromoError(errMsg);
            toast.error(errMsg);
        }
    };

    // const { handleRazorpayPayment: processRazorpayPayment } = useRazorpayPayment();
    const { handleCashfreePayment: processCashfreePayment } = useCashfreePayment();

    const handleCashfreePayment = () => {
        const activeAddress = savedAddresses.find((a: any) => a._id === selectedAddressMode) || (selectedAddressMode !== 'new' ? savedAddresses[0] : null);
        processCashfreePayment({
            activeAddress,
            cartItems,
            subtotal,
            taxes,
            shipping,
            total,
            userEmail,
            setIsProcessingPayment,
            clearCart,
            router
        });
    };

    const handleEditClick = (e: React.MouseEvent, addr: any) => {
        e.stopPropagation();
        setSelectedAddressMode(addr._id);
        setEditingAddressId(addr._id);

        let phoneVal = addr.phone || '';
        if (phoneVal.startsWith('+91 ')) phoneVal = phoneVal.replace('+91 ', '');
        else if (phoneVal.startsWith('+91')) phoneVal = phoneVal.replace('+91', '');

        setFormData({
            fullName: addr.fullName || '',
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            landmark: addr.landmark || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.zip || '',
            isDefault: addr.isDefault || false,
            phone: phoneVal
        });
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setAddressToDelete(id);
    };

    const handleSetDefault = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await updateAddress(id, { isDefault: true } as any);
            const latestData = await fetchAddresses();
            const sortedLatestData = latestData.sort((a: any, b: any) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
            setSavedAddresses(sortedLatestData);
        } catch (error) {
            console.error('Failed to set default address', error);
        }
    };

    const handleSaveAddress = async () => {
        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.zip || formData.zip.length !== 6 || formData.phone.length !== 10) {
            setShowErrors(true);
            return;
        }
        setShowErrors(false);

        try {
            const dataToSave = { ...formData, phone: '+91 ' + formData.phone };
            if (editingAddressId === 'new') {
                const newAddr = await addAddress(dataToSave);
                setSavedAddresses([...savedAddresses, newAddr]);
                setSelectedAddressMode(newAddr._id);
            } else {
                const updatedAddr = await updateAddress(editingAddressId!, dataToSave);
                setSavedAddresses(prev => prev.map(a => a._id === editingAddressId ? updatedAddr : a));
            }

            // Refetch to ensure state is perfectly synced (like default updates)
            const latestData = await fetchAddresses();
            const sortedLatestData = latestData.sort((a: any, b: any) => (b.isDefault === true ? 1 : 0) - (a.isDefault === true ? 1 : 0));
            setSavedAddresses(sortedLatestData);

            setEditingAddressId(null);
        } catch (error) {
            console.error('Failed to save address', error);
        }
    };



    const activeAddress = savedAddresses.find(a => a._id === selectedAddressMode) || savedAddresses[0];

    const addressSelectionUI = (
        <AddressSection
            savedAddresses={savedAddresses}
            selectedAddressMode={selectedAddressMode}
            setSelectedAddressMode={setSelectedAddressMode}
            editingAddressId={editingAddressId}
            setEditingAddressId={setEditingAddressId}
            handleEditClick={handleEditClick}
            handleDeleteClick={handleDeleteClick}
            handleSetDefault={handleSetDefault}
            handleSaveAddress={handleSaveAddress}
            checkoutStep={checkoutStep}
            router={router}
            setIsAddressModalOpen={setIsAddressModalOpen}
            formData={formData}
            setFormData={setFormData}
            showErrors={showErrors}
            showAddressLine2={showAddressLine2}
            setShowAddressLine2={setShowAddressLine2}
            showLandmark={showLandmark}
            setShowLandmark={setShowLandmark}
        />
    );

    const cartSummaryUI = (
        <div className="bg-white rounded shadow-sm">
            <div
                className="px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between cursor-pointer"
                onClick={() => setIsCartExpanded(!isCartExpanded)}
            >
                <h2 className="text-lg font-bold text-gray-900">{cartCount} {cartCount === 1 ? 'item' : 'items'}</h2>
                <button className="text-sm text-[#458500] hover:underline flex items-center gap-1 cursor-pointer font-medium">
                    {isCartExpanded ? 'Collapse' : 'Expand'}
                    <svg className={`w-4 h-4 transform transition-transform ${isCartExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {isCartExpanded ? (
                <div className="px-3 sm:px-6 py-3 sm:py-6 border-t-2 border-gray-300 flex flex-col">
                    {cartItems.map((item, idx) => {
                        const price = item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                        return (
                            <div key={idx} onClick={() => router.push('/products/' + item.product._id)} className="flex gap-4 cursor-pointer group border-b border-gray-200 pb-2 sm:pb-4 mb-3 sm:mb-4 last:border-b-0 last:pb-0 last:mb-0">
                                <div className="w-20 h-20 shrink-0 bg-white border border-gray-200 rounded p-1">
                                    {item.product.images && item.product.images.length > 0 ? (
                                        <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${item.product.images[0]}`} alt={item.product.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    {/* Product name full width */}
                                    <div className="text-[11px] sm:text-sm font-medium text-gray-900 break-words leading-snug group-hover:text-green-700 transition-colors">
                                        {item.product.name}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div>
                                            <div className="text-xs text-gray-500">Weight: {item.product.weight || '0'} {item.product.weightUnit || 'kg'}</div>
                                            <div className="text-sm font-bold text-gray-900 mt-1">
                                                ₹{(price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div className="border border-gray-300 rounded-full flex items-center px-2 sm:px-4 py-1 sm:py-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                                            {item.quantity === 1 ? (
                                                <svg onClick={() => setCartItemToDelete(item.product._id)} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 cursor-pointer hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            ) : (
                                                <svg onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 cursor-pointer hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                            )}
                                            <span className="mx-2 sm:mx-4 text-sm sm:text-base font-bold text-gray-700">{item.quantity}</span>
                                            <svg onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 cursor-pointer hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="px-3 sm:px-6 py-2 border-t-2 border-gray-300">
                    <div className="flex overflow-x-auto gap-3 pb-1 sm:pb-2 mt-1 sm:mt-3">
                        {cartItems.map((item, idx) => (
                            <div key={idx} onClick={() => router.push('/products/' + item.product._id)} className="shrink-0 text-center w-[80px] cursor-pointer group">
                                <div className="w-[80px] h-[80px] mb-2 flex items-center justify-center p-1 border border-gray-200 rounded bg-white">
                                    {item.product.images && item.product.images.length > 0 ? (
                                        <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${item.product.images[0]}`} alt={item.product.name} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="text-[11px] sm:text-[12] text-gray-700 font-bold">Qty: {item.quantity}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );


    return (
        <div className="flex-1 bg-[#f5f5f5] pb-4 sm:pb-6">
            {isPreparingGPay && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-12 w-12 text-[#458500]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                </div>
            )}
            <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 py-3 sm:py-4 flex flex-col lg:flex-row gap-3 sm:gap-6">

                {/* LEFT COLUMN */}
                <div className="flex-1 space-y-2 sm:space-y-6">

                    {checkoutStep === 1 && (
                        <>
                            <div className="bg-white rounded shadow-sm overflow-hidden mb-2 sm:mb-6">
                                <div className="p-3 sm:p-6">
                                    <h2 className="text-[18px] sm:text-[22px] font-bold text-gray-900 mb-1 sm:mb-4">Shipping information</h2>
                                    <h3 className="text-base font-bold text-gray-900 mb-3 sm:mb-4">Select a shipping address</h3>

                                    {addressSelectionUI}
                                </div>
                            </div>
                        </>
                    )}

                    {checkoutStep === 2 && (
                        <>
                            <div className="bg-white rounded shadow-sm p-3 sm:p-6 relative">
                                <button onClick={() => router.push('?step=1')} className="absolute top-6 right-6 text-sm text-[#458500] hover:text-[#366800] hover:underline cursor-pointer">Change</button>
                                <h2 className="text-[18px] sm:text-[22px] font-bold text-gray-900 mb-2 sm:mb-4">Shipping information</h2>
                                <div className="text-[15px] sm:text-[16px] text-gray-900 space-y-1 font-bold">
                                    {activeAddress?.fullName || 'No address selected'}
                                </div>
                                <div className="text-[13px] text-gray-600 mt-1 mb-2">
                                    {activeAddress ? `${activeAddress.addressLine1} | ${activeAddress.city}, ${activeAddress.state}, ${activeAddress.zip} | India | ${activeAddress.phone}` : ''}
                                </div>

                                <div className="pt-2 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
                                    We&apos;ll send order confirmations to <span className="font-bold">{userEmail || 'your email'}</span>
                                </div>
                            </div>


                            <PaymentMethod
                                selectedPaymentMethod={selectedPaymentMethod}
                                setSelectedPaymentMethod={(method) => {
                                    setSelectedPaymentMethod(method);
                                    setShowCardError(false);
                                    setShowGPayButton(false);
                                    setIsProcessingGPay(false);
                                    setIsPreparingGPay(false);
                                }}
                                isProcessingGPay={isProcessingGPay}
                                isPreparingGPay={isPreparingGPay || isProcessingPayment}
                                onProcessGPay={handleGPayProcess}
                            />
                        </>
                    )}

                    {cartSummaryUI}

                </div>

                {/* RIGHT COLUMN */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="lg:sticky lg:top-[135px] bg-white rounded shadow-sm p-4 sm:p-5 border border-gray-200">
                        <h2 className="font-bold text-gray-900 text-lg mb-3 sm:mb-4">Order summary</h2>

                        <div className="space-y-3 border-b border-gray-200 pb-2 sm:pb-4 mb-2 sm:mb-4">
                            <div className="flex justify-between text-sm sm:text-[15px]">
                                <span className="text-gray-600">Items total ({cartCount})</span>
                                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3 border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                            <div className="flex justify-between text-sm sm:text-[15px]">
                                <span className="text-gray-900 font-bold">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-[15px]">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-900">₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-[15px]">
                                <span className="text-gray-600 flex items-center gap-1">Duties & Taxes <svg onClick={() => setInfoModal('duties')} className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-gray-500 cursor-pointer hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                                <span className="text-gray-900">₹{taxes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {appliedPromo && (
                                <div className="flex justify-between text-sm sm:text-[15px]">
                                    <span className="text-green-700 font-bold">Promo Discount ({appliedPromo.code})</span>
                                    <span className="text-green-700 font-bold">-₹{promoDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>

                        {/* Promo Code Input Box */}
                        <div className="mb-4">
                            <PromoCodeSection
                                isLoggedIn={true}
                                doctorPromo={doctorPromo}
                                appliedPromo={appliedPromo}
                                promoCodeInput={promoCodeInput}
                                promoError={promoError}
                                onApplyPromo={handleApplyPromoCode}
                                onRemovePromo={() => {
                                    setAppliedPromo(null);
                                    setPromoCodeInput('');
                                    sessionStorage.removeItem('appliedPromo');
                                    toast.success('Promo code removed');
                                }}
                                onInputChange={(val) => {
                                    setPromoCodeInput(val);
                                    setPromoError('');
                                }}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-4 sm:mb-6 mt-2">
                            <span className="text-[16px] sm:text-[18px] font-bold text-gray-900">Total</span>
                            <span className="text-[16px] sm:text-[18px] font-bold text-gray-900">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-2 sm:pt-4">
                            {showGPayButton && selectedPaymentMethod === 'gpay' ? (
                                <button type="button" onClick={(e) => {
                                    e.preventDefault();
                                    // The actual Google Pay flow will be handled here
                                }} className="w-full bg-black hover:bg-gray-900 text-white font-normal py-2 sm:py-3 px-6 rounded-md transition-colors mb-4 flex items-center justify-center cursor-pointer">
                                    <img src="/google-pay.png" alt="Google Pay" className="h-5 sm:h-6 object-contain" />
                                </button>
                            ) : (
                                <button type="button" onClick={(e) => {
                                    e.preventDefault();
                                    if (cartItems.length === 0) {
                                        router.push('/');
                                        return;
                                    }
                                    if (!userName) {
                                        toast.error('Please complete your profile');
                                        return;
                                    }
                                    if (checkoutStep === 1) {
                                        if (selectedAddressMode === 'new') {
                                            toast.error('Please add the address');
                                            return;
                                        }
                                        router.push('/checkout?step=2');
                                        return;
                                    }
                                    if (!selectedPaymentMethod) {
                                        toast.error('Please select a payment method');
                                    } else if (selectedPaymentMethod === 'card') {
                                        // setShowCardError(true);
                                        handleCashfreePayment();
                                    } else if (selectedPaymentMethod === 'gpay') {
                                        handleGPayProcess();
                                    }
                                }} disabled={isPreparingGPay || isProcessingPayment} className="w-full bg-[#458500] hover:bg-[#366800] text-white font-normal py-2 sm:py-3 px-6 rounded-md transition-colors font-bold mb-4 text-[16px] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                                    {isProcessingPayment ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        cartItems.length === 0 ? 'Select the product' : (checkoutStep === 1 ? 'Continue' : 'Place Order')
                                    )}
                                </button>
                            )}
                        </div>

                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            By clicking &quot;Place Order&quot;, you agree to iHerb&apos;s <span className="text-blue-600 hover:underline cursor-pointer">Terms of Use</span>, <span className="text-blue-600 hover:underline cursor-pointer">Refund Policy</span> and <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>.
                        </p>
                    </div>
                </div>

            </div>

            <ConfirmModal
                isOpen={addressToDelete !== null}
                title="Remove Address"
                description="Are you sure you want to remove this address?"
                onCancel={() => setAddressToDelete(null)}
                onConfirm={async () => {
                    if (addressToDelete) {
                        try {
                            await removeAddress(addressToDelete);
                            setSavedAddresses(prev => prev.filter(a => a._id !== addressToDelete));
                            if (selectedAddressMode === addressToDelete) {
                                const remaining = savedAddresses.filter(a => a._id !== addressToDelete);
                                if (remaining.length > 0) {
                                    setSelectedAddressMode(remaining[0]._id);
                                } else {
                                    setSelectedAddressMode('new');
                                    setEditingAddressId('new');
                                    setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '', isDefault: false });
                                }
                            }
                        } catch (error) {
                            console.error('Failed to delete address', error);
                        }
                    }
                    setAddressToDelete(null);
                }}
                cancelText="Cancel"
                confirmText="Remove"
                isLoading={false}
            />

            <ConfirmModal
                isOpen={cartItemToDelete !== null}
                title="Remove Item"
                description="Are you sure you want to remove this item from your cart?"
                onCancel={() => setCartItemToDelete(null)}
                onConfirm={() => {
                    if (cartItemToDelete) {
                        removeFromCart(cartItemToDelete);
                    }
                    setCartItemToDelete(null);
                }}
                cancelText="Cancel"
                confirmText="Remove"
                isLoading={false}
            />

            {/* Info Modal */}
            {infoModal && (
                <div onClick={() => setInfoModal(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-4 sm:p-5 max-w-md w-full relative shadow-xl">
                        <button onClick={() => setInfoModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pr-6">
                            {infoModal === 'duties' && 'Duty, Taxes, & Fees'}
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-700 space-y-4">
                            {infoModal === 'duties' && (
                                <p>Imported goods are subject to import duties and taxes which are levied by the local government agency in India. The types of import charges include customs duty and Goods and Services Tax (GST). With DDP (Delivered Duties Paid), you do not have to pay any additional duty/tax at the time of delivery.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 min-h-[100vh] bg-[#f5f5f5]">
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]">
                    <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-[#458500]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
