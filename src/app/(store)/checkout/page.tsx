'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { fetchAddresses, addAddress, updateAddress, removeAddress } from '@/services/addressService';
import ConfirmModal from '@/components/ConfirmModal';
import toast from 'react-hot-toast';
import PaymentMethod from '@/components/PaymentMethod';
import { useRazorpayPayment } from './useRazorpayPayment';

const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

function CheckoutContent() {
    const { cartItems, cartCount, updateQuantity, removeFromCart, moveToList, clearCart } = useCart();
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
    }, [router]);

    const handleGPayProcess = () => {
        handleRazorpayPayment();
    };

    // Total calculation
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price) * item.quantity, 0);
    const shipping = cartItems.length === 0 ? 0 : (subtotal > 1000 ? 0 : 99);
    const taxes = subtotal * 0.05; // 5% taxes
    const total = subtotal + (cartItems.length > 0 ? shipping + taxes : 0);

    const { handleRazorpayPayment: processRazorpayPayment } = useRazorpayPayment();

    const handleRazorpayPayment = () => {
        const activeAddress = savedAddresses.find((a: any) => a._id === selectedAddressMode) || (selectedAddressMode !== 'new' ? savedAddresses[0] : null);
        processRazorpayPayment({
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
        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.zip || formData.phone.length !== 10) {
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

    const addressFormUI = (
        <div className="mt-6 ml-1 sm:ml-8" onClick={(e) => e.stopPropagation()}>
            <form className="space-y-1.5 sm:space-y-3" onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }}>
                <div className="relative pt-2">
                    <input type="text" id="country" value="India" readOnly className="peer w-full border border-gray-300 rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm text-gray-700 hover:cursor-not-allowed focus:outline-none focus:border-gray-300 focus:ring-0" />
                    <label htmlFor="country" className="absolute left-2 -top-0 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs peer-focus:text-gray-500 z-10 pointer-events-none">
                        Country / Region*
                    </label>
                </div>

                <div className="relative pt-2">
                    <input type="text" id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: toTitleCase(e.target.value) })} className={`peer w-full border ${showErrors && !formData.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && !formData.fullName ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`} placeholder=" " />
                    <label htmlFor="fullName" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.fullName ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                        Full Name*
                    </label>
                    {showErrors && !formData.fullName && (
                        <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    {showErrors && !formData.fullName && <p className="text-[#d32f2f] text-xs mt-1">Full name is required. Please use a space to separate first and last names.</p>}
                </div>

                <div className="relative pt-2">
                    <input type="text" id="addressLine1" maxLength={45} value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: toTitleCase(e.target.value) })} className={`peer w-full border ${showErrors && !formData.addressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-md pr-10 sm:pr-12 px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && !formData.addressLine1 ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`} placeholder=" " />
                    <label htmlFor="addressLine1" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.addressLine1 ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                        Address Line 1*
                    </label>
                    <div className="absolute right-2 sm:right-3 top-[19px] sm:top-[22px] text-xs text-gray-400 pointer-events-none">
                        {45 - (formData.addressLine1?.length || 0)}
                    </div>
                    {showErrors && !formData.addressLine1 && (
                        <div className="absolute right-10 sm:right-12 top-[18px] sm:top-[21px] pointer-events-none">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    {showErrors && !formData.addressLine1 && <p className="text-[#d32f2f] text-xs mt-1">Address Line 1 is required.</p>}
                </div>

                {showAddressLine2 ? (
                    <div className="relative pt-2">
                        <input type="text" id="addressLine2" maxLength={25} value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: toTitleCase(e.target.value) })} className="peer w-full border border-gray-300 rounded-md pr-10 sm:pr-12 px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none focus:border-green-600 focus:ring-0.5 focus:ring-green-600" placeholder=" " />
                        <label htmlFor="addressLine2" className="absolute left-2 -top-0 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs peer-focus:text-green-600 z-10 pointer-events-none">
                            Address Line 2
                        </label>
                        <div className="absolute right-2 sm:right-3 top-[19px] sm:top-[22px] text-xs text-gray-400 pointer-events-none">
                            {25 - (formData.addressLine2?.length || 0)}
                        </div>
                    </div>
                ) : (
                    <div className="pt-1">
                        <button type="button" onClick={() => setShowAddressLine2(true)} className="text-[12px] sm:text-sm text-green-600 hover:underline text-left w-max cursor-pointer block">Add Address Line 2</button>
                    </div>
                )}

                {showLandmark ? (
                    <div className="relative pt-2">
                        <input type="text" id="landmark" maxLength={10} value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: toTitleCase(e.target.value) })} className="peer w-full border border-gray-300 rounded-md pr-10 sm:pr-12 px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none focus:border-green-600 focus:ring-0.5 focus:ring-green-600" placeholder=" " />
                        <label htmlFor="landmark" className="absolute left-2 -top-0 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs peer-focus:text-green-600 z-10 pointer-events-none">
                            Landmarks
                        </label>
                        <div className="absolute right-2 sm:right-3 top-[19px] sm:top-[22px] text-xs text-gray-400 pointer-events-none">
                            {10 - (formData.landmark?.length || 0)}
                        </div>
                    </div>
                ) : (
                    <div className="pt-1">
                        <button type="button" onClick={() => setShowLandmark(true)} className="text-[12px] sm:text-sm text-green-600 hover:underline text-left w-max cursor-pointer block">Add landmarks</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-3">
                    <div className="relative pt-2">
                        <input type="text" id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: toTitleCase(e.target.value) })} className={`peer w-full border ${showErrors && !formData.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && !formData.city ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`} placeholder=" " />
                        <label htmlFor="city" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.city ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            City*
                        </label>
                        {showErrors && !formData.city && (
                            <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.city && <p className="text-[#d32f2f] text-xs mt-1">City is required.</p>}
                    </div>

                    <div className="relative pt-2">
                        <input type="text" id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: toTitleCase(e.target.value) })} className={`peer w-full border ${showErrors && !formData.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && !formData.state ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`} placeholder=" " />
                        <label htmlFor="state" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.state ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            State*
                        </label>
                        {showErrors && !formData.state && (
                            <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.state && <p className="text-[#d32f2f] text-xs mt-1">State/Province/Territory/Region is required.</p>}
                    </div>

                    <div className="relative pt-2">
                        <input type="text" id="zip" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className={`peer w-full border ${showErrors && !formData.zip ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && !formData.zip ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`} placeholder=" " />
                        <label htmlFor="zip" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.zip ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            Postal Code*
                        </label>
                        {showErrors && !formData.zip && (
                            <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.zip && <p className="text-[#d32f2f] text-xs mt-1">Postal Code is required.</p>}
                    </div>
                </div>

                <div className="relative pt-2">
                    <input type="text" id="phone" maxLength={10} value={formData.phone} onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setFormData({ ...formData, phone: val });
                    }} className={`peer w-full border ${showErrors && formData.phone.length !== 10 ? 'border-red-500' : 'border-gray-300'} rounded-md pl-[38px] sm:pl-[42px] px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && formData.phone.length !== 10 ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`} placeholder=" " />
                    <label htmlFor="phone" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:left-[36px] sm:peer-placeholder-shown:left-[40px] peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:left-2 sm:peer-focus:left-2 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && formData.phone.length !== 10 ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                        Mobile Number*
                    </label>
                    <div className="absolute left-3 top-[13px] sm:top-[18px] pointer-events-none">
                        <span className="text-[13.5px] sm:text-sm text-green-700">+91</span>
                    </div>
                    {showErrors && formData.phone.length !== 10 && (
                        <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    {showErrors && formData.phone.length !== 10 && <p className="text-[#d32f2f] text-xs mt-1">A valid 10-digit phone number is required.</p>}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="default-addr" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer accent-[#458500]" />
                    <label htmlFor="default-addr" className="text-[12px] sm:text-sm text-gray-700 cursor-pointer">Set as my default shipping address</label>
                </div>

                <div className="pt-4 flex flex-col md:flex-row justify-end gap-3 w-full">
                    {editingAddressId !== 'new' && (
                        <button type="button" onClick={() => setEditingAddressId(null)} className="w-full md:w-auto border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-2 sm:py-3 px-4 sm:px-16 rounded-md transition-colors shadow-sm text-[14px] sm:text-[16px] cursor-pointer bg-white">
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="w-full md:w-auto bg-[#458500] hover:bg-[#366800] text-white font-bold py-2 sm:py-3 px-10 sm:px-16 rounded-md transition-colors shadow-sm text-[15px] sm:text-[16px] cursor-pointer">
                        Save and Continue
                    </button>
                </div>
            </form>
        </div>
    );

    const activeAddress = savedAddresses.find(a => a._id === selectedAddressMode) || savedAddresses[0];

    const addressSelectionUI = (
        <div className="space-y-2 sm:space-y-4">
            {/* Saved Addresses */}
            {savedAddresses.map((addr) => (
                <div
                    key={addr._id}
                    className={`border rounded-md p-3 sm:p-4 cursor-pointer transition-colors ${selectedAddressMode === addr._id ? 'border-[#458500] bg-white' : 'border-gray-300 bg-white'}`}
                    onClick={() => {
                        setSelectedAddressMode(addr._id);
                        setEditingAddressId(null);
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <input
                                    type="radio"
                                    checked={selectedAddressMode === addr._id}
                                    onChange={() => {
                                        setSelectedAddressMode(addr._id);
                                        setEditingAddressId(null);
                                    }}
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#458500] border-gray-300 focus:ring-[#458500] accent-[#458500] cursor-pointer shrink-0"
                                />
                                <span className="font-bold text-gray-900 text-[14px] sm:text-[16px] leading-none">{addr.fullName}</span>
                            </div>
                            <div className="flex gap-3 text-gray-500">
                                <button onClick={(e) => handleEditClick(e, addr)} className="hover:text-gray-700 cursor-pointer">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={(e) => handleDeleteClick(e, addr._id)} className="hover:text-gray-700 cursor-pointer">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="pl-6 sm:pl-8">
                            <div className="text-[12px] sm:text-[14px] text-gray-500">
                                <div>{addr.addressLine1},{addr.addressLine2}{addr.addressLine2 ? ' - ' : ''}{addr.zip},</div>
                                <div>{addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state}</div>
                            </div>
                            {editingAddressId !== addr._id && (
                                <div className="mt-3 flex justify-between items-center">
                                    <div className="text-[12px] sm:text-sm">
                                        {addr.isDefault ? (
                                            <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 inline-block">Default Address</span>
                                        ) : (
                                            <button type="button" onClick={(e) => handleSetDefault(e, addr._id)} className="text-[#458500] hover:underline hover:text-[#366800] cursor-pointer font-medium">Set as Default</button>
                                        )}
                                    </div>

                                    {selectedAddressMode === addr._id && (
                                        <button type="button" onClick={() => {
                                            if (checkoutStep === 1) {
                                                router.push('?step=2');
                                            } else {
                                                setIsAddressModalOpen(false);
                                            }
                                        }} className="bg-[#458500] hover:bg-[#366800] text-white font-normal py-1.5 sm:py-2.5 px-4 sm:px-12 rounded-md transition-colors font-bold text-[14px] sm:text-[15px] cursor-pointer">
                                            Continue
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {editingAddressId === addr._id && addressFormUI}
                </div>
            ))}

            {/* Add New Address Option */}
            <div
                className={`border rounded-md p-4 transition-colors ${selectedAddressMode === 'new' ? 'border-[#458500] bg-white border-2' : 'border-gray-300 bg-white cursor-pointer'}`}
                onClick={() => {
                    if (selectedAddressMode !== 'new') {
                        setSelectedAddressMode('new');
                        setEditingAddressId('new');
                        setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '', isDefault: false });
                    }
                }}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <input
                        type="radio"
                        checked={selectedAddressMode === 'new'}
                        onChange={() => {
                            setSelectedAddressMode('new');
                            setEditingAddressId('new');
                            setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '', isDefault: false });
                        }}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-gray-300 focus:ring-green-500 accent-[#458500] cursor-pointer shrink-0"
                    />
                    <span className="font-bold text-gray-900 text-[14px] sm:text-[18px] leading-none">Add a new shipping address</span>
                </div>

                {selectedAddressMode === 'new' && editingAddressId === 'new' && addressFormUI}
                {selectedAddressMode === 'new' && editingAddressId !== 'new' && (
                    <div className="mt-4 ml-8">
                        <button type="button" onClick={() => { setEditingAddressId('new'); setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '', isDefault: false }); }} className="bg-[#458500] hover:bg-[#366800] text-white font-normal py-3 px-12 rounded-md transition-colors font-bold mb-4 text-[16px] cursor-pointer">
                            Fill New Address Form
                        </button>
                    </div>
                )}
            </div>
        </div>
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
    if (isLoadingAddresses) {
        return (
            <div className="flex-1 min-h-[100vh] bg-[#f5f5f5]">
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]">
                    <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-[#458500]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
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
                                    <h2 className="text-[12px] sm:text-[22px] font-bold text-gray-900 mb-1 sm:mb-4">Shipping information</h2>
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
                    <div className="lg:sticky lg:top-6 bg-white rounded shadow-sm p-4 sm:p-5">
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
                                        handleRazorpayPayment();
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
