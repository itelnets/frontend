'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { fetchAddresses, addAddress, updateAddress, removeAddress } from '@/services/addressService';

function CheckoutContent() {
    const { cartItems, cartCount, updateQuantity, removeFromCart, moveToList } = useCart();
    const [showErrors, setShowErrors] = useState(false);

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [showAddressLine2, setShowAddressLine2] = useState(false);
    const [showLandmark, setShowLandmark] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [selectedAddressMode, setSelectedAddressMode] = useState('new'); // address _id or 'new'
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null); // address _id or 'new'
    const [formData, setFormData] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        zip: '',
        phone: '+91 ',
        isDefault: false
    });

    const router = useRouter();
    const searchParams = useSearchParams();
    const checkoutStep = searchParams.get('step') === '2' ? 2 : 1;

    // Fetch addresses on mount
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const data = await fetchAddresses();
                setSavedAddresses(data);
                if (data.length > 0) {
                    const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
                    setSelectedAddressMode(defaultAddr._id);
                } else {
                    setSelectedAddressMode('new');
                    setEditingAddressId('new');
                }
            } catch (error) {
                console.error("Failed to load addresses");
            } finally {
                setIsLoadingAddresses(false);
            }
        };
        loadAddresses();
    }, []);

    // Total calculation
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price) * item.quantity, 0);
    const shipping = 0; // Match cart
    const duties = 0; // Match cart
    const total = subtotal + (cartItems.length > 0 ? shipping + duties : 0);

    const handleEditClick = (e: React.MouseEvent, addr: any) => {
        e.stopPropagation();
        setSelectedAddressMode(addr._id);
        setEditingAddressId(addr._id);
        setFormData({ ...addr });
    };

    const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await removeAddress(id);
            setSavedAddresses(prev => prev.filter(a => a._id !== id));
            if (selectedAddressMode === id) {
                const remaining = savedAddresses.filter(a => a._id !== id);
                if (remaining.length > 0) {
                    setSelectedAddressMode(remaining[0]._id);
                } else {
                    setSelectedAddressMode('new');
                    setEditingAddressId('new');
                    setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '+91', isDefault: false });
                }
            }
        } catch (error) {
            console.error('Failed to delete address', error);
        }
    };

    const handleSaveAddress = async () => {
        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.zip || !formData.phone) {
            setShowErrors(true);
            return;
        }
        setShowErrors(false);

        try {
            if (editingAddressId === 'new') {
                const newAddr = await addAddress(formData);
                setSavedAddresses([...savedAddresses, newAddr]);
                setSelectedAddressMode(newAddr._id);
            } else {
                const updatedAddr = await updateAddress(editingAddressId!, formData);
                setSavedAddresses(prev => prev.map(a => a._id === editingAddressId ? updatedAddr : a));
            }

            // Refetch to ensure state is perfectly synced (like default updates)
            const latestData = await fetchAddresses();
            setSavedAddresses(latestData);

            setEditingAddressId(null);
        } catch (error) {
            console.error('Failed to save address', error);
        }
    };

    const addressFormUI = (
        <div className="mt-6 ml-1 sm:ml-8" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#fff9e6] border border-[#ffecb3] rounded-md p-4 flex gap-3 mb-6">
                <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <div className="text-sm text-gray-800 leading-snug">
                    <span className="font-bold">Per India Customs,</span> all customers ordering internationally are required to complete KYC documents for customs clearance. The shipping information must be an exact match to the consignee&apos;s name and residential address on the KYC documents. If the carrier does not receive KYC documents within 7 days, your order will be returned.
                </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }}>
                <div className="relative pt-2">
                    <input type="text" id="country" value="India" readOnly className="peer w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 bg-white cursor-default" placeholder=" " />
                    <label htmlFor="country" className="absolute left-2 -top-1 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs peer-focus:text-gray-500 z-10 pointer-events-none">
                        Country / Region*
                    </label>
                </div>

                <div className="relative pt-2">
                    <input type="text" id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className={`peer w-full border ${showErrors && !formData.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:outline-none ${showErrors && !formData.fullName ? '' : 'focus:border-green-600 focus:ring-1 focus:ring-green-600'}`} placeholder=" " />
                    <label htmlFor="fullName" className={`absolute left-2 -top-1 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.fullName ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                        Full Name (No business or company name)*
                    </label>
                    {showErrors && !formData.fullName && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    {showErrors && !formData.fullName && <p className="text-[#d32f2f] text-xs mt-1">Full name is required. Please use a space to separate first and last names.</p>}
                </div>

                <div className="relative pt-2">
                    <input type="text" id="addressLine1" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} className={`peer w-full border ${showErrors && !formData.addressLine1 ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:outline-none ${showErrors && !formData.addressLine1 ? '' : 'focus:border-green-600 focus:ring-1 focus:ring-green-600'}`} placeholder=" " />
                    <label htmlFor="addressLine1" className={`absolute left-2 -top-1 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.addressLine1 ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                        Address Line 1*
                    </label>
                    {showErrors && !formData.addressLine1 && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    {showErrors && !formData.addressLine1 && <p className="text-[#d32f2f] text-xs mt-1">Address Line 1 is required.</p>}
                </div>

                {showAddressLine2 ? (
                    <div className="relative pt-2">
                        <input type="text" id="addressLine2" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} className="peer w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" placeholder=" " />
                        <label htmlFor="addressLine2" className="absolute left-2 -top-1 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs peer-focus:text-green-600 z-10 pointer-events-none">
                            Address Line 2
                        </label>
                    </div>
                ) : (
                    <div className="pt-1">
                        <button type="button" onClick={() => setShowAddressLine2(true)} className="text-sm text-blue-600 hover:underline text-left w-max cursor-pointer block">Add Address Line 2</button>
                    </div>
                )}

                {showLandmark ? (
                    <div className="relative pt-2">
                        <input type="text" id="landmark" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="peer w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" placeholder=" " />
                        <label htmlFor="landmark" className="absolute left-2 -top-1 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs peer-focus:text-green-600 z-10 pointer-events-none">
                            Major landmarks
                        </label>
                    </div>
                ) : (
                    <div className="pt-1">
                        <button type="button" onClick={() => setShowLandmark(true)} className="text-sm text-blue-600 hover:underline text-left w-max cursor-pointer block">Add Major landmarks</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative pt-2">
                        <input type="text" id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={`peer w-full border ${showErrors && !formData.city ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:outline-none ${showErrors && !formData.city ? '' : 'focus:border-green-600 focus:ring-1 focus:ring-green-600'}`} placeholder=" " />
                        <label htmlFor="city" className={`absolute left-2 -top-1 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.city ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            Colony/Area name*
                        </label>
                        {showErrors && !formData.city && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.city && <p className="text-[#d32f2f] text-xs mt-1">City is required.</p>}
                    </div>

                    <div className="relative pt-2">
                        <input type="text" id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={`peer w-full border ${showErrors && !formData.state ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:outline-none ${showErrors && !formData.state ? '' : 'focus:border-green-600 focus:ring-1 focus:ring-green-600'}`} placeholder=" " />
                        <label htmlFor="state" className={`absolute left-2 -top-1 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.state ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            State / Region*
                        </label>
                        {showErrors && !formData.state && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.state && <p className="text-[#d32f2f] text-xs mt-1">State/Province/Territory/Region is required.</p>}
                    </div>

                    <div className="relative pt-2">
                        <input type="text" id="zip" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className={`peer w-full border ${showErrors && !formData.zip ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:outline-none ${showErrors && !formData.zip ? '' : 'focus:border-green-600 focus:ring-1 focus:ring-green-600'}`} placeholder=" " />
                        <label htmlFor="zip" className={`absolute left-2 -top-1 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.zip ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            Zip / Postal Code*
                        </label>
                        {showErrors && !formData.zip && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.zip && <p className="text-[#d32f2f] text-xs mt-1">Postal Code is required.</p>}
                    </div>
                </div>

                <div className="relative pt-2">
                    <input type="text" id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`peer w-full border ${showErrors && !formData.phone ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 text-sm focus:outline-none ${showErrors && !formData.phone ? '' : 'focus:border-green-600 focus:ring-1 focus:ring-green-600'}`} placeholder=" " />
                    <label htmlFor="phone" className={`absolute left-2 -top-1 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-1 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.phone ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                        Mobile Number / Billing Phone Number*
                    </label>
                    {showErrors && !formData.phone && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none top-2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    )}
                    {showErrors && !formData.phone && <p className="text-[#d32f2f] text-xs mt-1">Phone number is required.</p>}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="default-addr" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer accent-[#458500]" />
                    <label htmlFor="default-addr" className="text-sm text-gray-700 cursor-pointer">Set as my default shipping address</label>
                </div>

                <div className="pt-4 flex flex-col md:flex-row justify-end gap-3 w-full">
                    {editingAddressId !== 'new' && (
                        <button type="button" onClick={() => setEditingAddressId(null)} className="w-full md:w-auto border border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-3 px-16 rounded-md transition-colors shadow-sm text-[16px] cursor-pointer bg-white">
                            Cancel
                        </button>
                    )}
                    <button type="submit" className="w-full md:w-auto bg-[#458500] hover:bg-[#366800] text-white font-bold py-3 px-16 rounded-md transition-colors shadow-sm text-[16px] cursor-pointer">
                        Save and Continue
                    </button>
                </div>
            </form>
        </div>
    );

    const activeAddress = savedAddresses.find(a => a._id === selectedAddressMode) || savedAddresses[0];

    const addressSelectionUI = (
        <div className="space-y-4">
            {/* Saved Addresses */}
            {savedAddresses.map((addr) => (
                <div
                    key={addr._id}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${selectedAddressMode === addr._id ? 'border-[#458500] bg-white' : 'border-gray-300 bg-white'}`}
                    onClick={() => {
                        setSelectedAddressMode(addr._id);
                        setEditingAddressId(null);
                    }}
                >
                    <div className="flex items-start gap-3">
                        <input
                            type="radio"
                            checked={selectedAddressMode === addr._id}
                            onChange={() => {
                                setSelectedAddressMode(addr._id);
                                setEditingAddressId(null);
                            }}
                            className="mt-1 w-5 h-5 text-[#458500] border-gray-300 focus:ring-[#458500] accent-[#458500] cursor-pointer"
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900 text-[16px]">{addr.fullName}</span>
                                <div className="flex gap-3 text-gray-500">
                                    <button onClick={(e) => handleEditClick(e, addr)} className="hover:text-gray-700 cursor-pointer">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={(e) => handleDeleteClick(e, addr._id)} className="hover:text-gray-700 cursor-pointer">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="text-[13px] text-gray-500">
                                {addr.addressLine1} | {addr.city}, {addr.state}, {addr.zip} | India | {addr.phone}
                            </div>
                        </div>
                    </div>

                    {editingAddressId === addr._id && addressFormUI}

                    {selectedAddressMode === addr._id && editingAddressId !== addr._id && (
                        <div className="mt-4 flex justify-end">
                            <button type="button" onClick={() => {
                                if (checkoutStep === 1) {
                                    router.push('?step=2');
                                } else {
                                    setIsAddressModalOpen(false);
                                }
                            }} className="bg-[#458500] hover:bg-[#366800] text-white font-normal py-3 px-20 rounded-md transition-colors font-bold text-[16px] cursor-pointer">
                                Continue
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Add New Address Option */}
            <div
                className={`border rounded-md p-4 transition-colors ${selectedAddressMode === 'new' ? 'border-[#458500] bg-white border-2' : 'border-gray-300 bg-white cursor-pointer'}`}
                onClick={() => {
                    if (selectedAddressMode !== 'new') {
                        setSelectedAddressMode('new');
                        setEditingAddressId('new');
                        setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '+91', isDefault: false });
                    }
                }}
            >
                <div className="flex items-center gap-3">
                    <input
                        type="radio"
                        checked={selectedAddressMode === 'new'}
                        onChange={() => {
                            setSelectedAddressMode('new');
                            setEditingAddressId('new');
                            setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '+91', isDefault: false });
                        }}
                        className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500 accent-[#458500] cursor-pointer"
                    />
                    <span className="font-bold text-gray-900 text-sm">Add a new shipping address</span>
                </div>

                {selectedAddressMode === 'new' && editingAddressId === 'new' && addressFormUI}
                {selectedAddressMode === 'new' && editingAddressId !== 'new' && (
                    <div className="mt-4 ml-8">
                        <button type="button" onClick={() => { setEditingAddressId('new'); setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '+91', isDefault: false }); }} className="bg-[#458500] hover:bg-[#366800] text-white font-normal py-3 px-12 rounded-md transition-colors font-bold mb-4 text-[16px] cursor-pointer">
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
                className="p-4 sm:p-6 flex items-center justify-between cursor-pointer"
                onClick={() => setIsCartExpanded(!isCartExpanded)}
            >
                <h2 className="text-lg font-bold text-gray-900">{cartCount} {cartCount === 1 ? 'item' : 'items'}</h2>
                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                    {isCartExpanded ? 'Collapse' : 'Expand'}
                    <svg className={`w-4 h-4 transform transition-transform ${isCartExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {isCartExpanded ? (
                <div className="px-4 sm:px-6 pb-6 border-t border-gray-100 pt-6 space-y-6">
                    {cartItems.map((item, idx) => {
                        const price = item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price;
                        return (
                            <div key={idx} className="flex gap-4">
                                <div className="w-20 h-20 shrink-0 bg-gray-50 border border-gray-200 rounded p-1">
                                    {item.product.images && item.product.images.length > 0 ? (
                                        <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${item.product.images[0]}`} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between gap-4">
                                        <div className="text-sm font-bold text-gray-900">{item.product.name}</div>
                                        <div className="text-sm font-bold text-gray-900">₹{(price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Weight: {item.product.weight || '0'} {item.product.weightUnit || 'kg'}</div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div onClick={() => moveToList(item.product)} className="text-sm text-blue-600 cursor-pointer">Move to lists</div>
                                        <div className="w-px h-3 bg-gray-300"></div>
                                        <div onClick={() => removeFromCart(item.product._id)} className="text-sm text-blue-600 cursor-pointer">Remove</div>
                                        <div className="ml-auto border border-gray-300 rounded-full flex items-center px-4 py-1.5">
                                            {item.quantity === 1 ? (
                                                <svg onClick={() => removeFromCart(item.product._id)} className="w-5 h-5 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            ) : (
                                                <svg onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-5 h-5 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                            )}
                                            <span className="mx-4 text-base font-bold text-gray-700">{item.quantity}</span>
                                            <svg onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="w-5 h-5 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-gray-100">
                    <div className="flex overflow-x-auto gap-4 pb-2 mt-4">
                        {cartItems.map((item, idx) => (
                            <div key={idx} className="shrink-0 text-center w-[80px]">
                                <div className="w-[80px] h-[80px] mb-2 flex items-center justify-center p-2 border border-gray-200 rounded">
                                    {item.product.images && item.product.images.length > 0 ? (
                                        <img src={item.product.images[0].startsWith('http') ? item.product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${item.product.images[0]}`} alt={item.product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-700 font-bold">Qty: {item.quantity}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="font-sans min-h-screen bg-[#f5f5f5] relative">
            <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-8 flex flex-col lg:flex-row gap-6">

                {/* LEFT COLUMN */}
                <div className="flex-1 space-y-6">

                    {checkoutStep === 1 && (
                        <>
                            <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
                                <div className="p-4 sm:p-6">
                                    <h2 className="text-[22px] font-bold text-gray-900 mb-6">Shipping information</h2>
                                    <h3 className="text-base font-bold text-gray-900 mb-4">Select a shipping address</h3>

                                    {isLoadingAddresses ? (
                                        <div className="py-8 text-center text-gray-500">Loading addresses...</div>
                                    ) : addressSelectionUI}
                                </div>
                            </div>

                            <div className="bg-white rounded shadow-sm opacity-60 mb-6">
                                <div className="p-4 sm:p-6">
                                    <h2 className="text-[22px] font-bold text-gray-400">Shipping method</h2>
                                </div>
                            </div>

                            <div className="bg-white rounded shadow-sm opacity-60 mb-6">
                                <div className="p-4 sm:p-6">
                                    <h2 className="text-[22px] font-bold text-gray-400">Payment method</h2>
                                </div>
                            </div>
                        </>
                    )}

                    {checkoutStep === 2 && (
                        <>
                            <div className="bg-white rounded shadow-sm p-6 relative">
                                <button onClick={() => router.push('?step=1')} className="absolute top-6 right-6 text-sm text-blue-600 hover:underline cursor-pointer">Change</button>
                                <h2 className="text-[22px] font-bold text-gray-900 mb-4">Shipping information</h2>
                                <div className="text-sm text-gray-900 space-y-1 font-bold">
                                    {activeAddress?.fullName || 'No address selected'}
                                </div>
                                <div className="text-[13px] text-gray-500 mt-1 mb-6">
                                    {activeAddress ? `${activeAddress.addressLine1} | ${activeAddress.city}, ${activeAddress.state}, ${activeAddress.zip} | India | ${activeAddress.phone}` : ''}
                                </div>

                                <div className="pt-4 border-t border-gray-100 text-sm text-gray-600">
                                    We&apos;ll send order confirmations to <span className="font-bold">admin@itelnets.com</span>
                                </div>
                            </div>

                            <div className="bg-white rounded shadow-sm p-6">
                                <h2 className="text-[22px] font-bold text-gray-900 mb-4">Shipping method</h2>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Aramex_logo.svg" alt="Aramex" className="w-16 h-16 object-contain" />
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Estimated delivery</div>
                                            <div className="text-lg font-bold text-gray-900 mb-1">JUL 22 - JUL 27</div>
                                            <div className="text-sm text-gray-700 mb-1">Aramex</div>
                                            <div className="text-sm text-green-600 font-bold flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                                free shipping
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-gray-900 text-lg">Free!</div>
                                </div>
                            </div>

                            <div className="bg-white rounded shadow-sm">
                                <div className="p-4 sm:p-6 pb-2 border-b border-gray-200">
                                    <h2 className="text-[22px] font-bold text-gray-900">Payment method</h2>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <h3 className="text-base font-bold text-gray-900 mb-4">Select a payment method</h3>

                                    <div className="border-2 border-[#458500] bg-[#f9fdf5] rounded p-4 mb-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <input type="radio" checked readOnly className="w-5 h-5 text-[#458500] border-gray-300 focus:ring-[#458500] accent-[#458500] cursor-pointer" />
                                            <label className="text-[15px] font-bold text-gray-900 flex-1">Pay with Razorpay</label>
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-5 object-contain" />
                                        </div>

                                        <div className="ml-8 text-sm text-gray-700">
                                            <p className="mb-3">You will be redirected to Razorpay&apos;s secure checkout to securely complete your purchase.</p>
                                            <p className="font-bold text-gray-900 mb-2">Supported Payment Methods:</p>
                                            <ul className="list-disc pl-4 space-y-1 text-gray-600">
                                                <li>Credit / Debit Cards (Visa, Mastercard, RuPay)</li>
                                                <li>UPI (Google Pay, PhonePe, Paytm, Amazon Pay)</li>
                                                <li>NetBanking (All major Indian banks)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {cartSummaryUI}

                </div>

                {/* RIGHT COLUMN */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <div className="lg:sticky lg:top-6 bg-white rounded shadow-sm p-6">
                        <h2 className="text-[18px] font-bold text-gray-900 mb-6">Order summary</h2>

                        <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Items total ({cartCount})</span>
                                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-b border-gray-200 pb-6 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-900 font-bold">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-900">₹--.--</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">Duties & Taxes <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg></span>
                                <span className="text-gray-900">₹--.--</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[18px] font-bold text-gray-900">Total</span>
                            <span className="text-[18px] font-bold text-gray-900">₹--.--</span>
                        </div>

                        <button className="w-full bg-[#458500] hover:bg-[#366800] text-white font-normal py-3 px-6 rounded-md transition-colors font-bold mb-4 text-[16px] cursor-pointer">
                            Place Order
                        </button>

                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            By clicking &quot;Place Order&quot;, you agree to iHerb&apos;s <span className="text-blue-600 hover:underline cursor-pointer">Terms of Use</span>, <span className="text-blue-600 hover:underline cursor-pointer">Refund Policy</span> and <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
