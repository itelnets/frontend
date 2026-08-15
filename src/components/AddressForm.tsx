'use client';

import React, { useState } from 'react';

interface AddressFormData {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    isDefault: boolean;
}

interface AddressFormProps {
    formData: AddressFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
    showErrors: boolean;
    showAddressLine2: boolean;
    setShowAddressLine2: (show: boolean) => void;
    showLandmark: boolean;
    setShowLandmark: (show: boolean) => void;
    editingAddressId: string | null;
    setEditingAddressId: (id: string | null) => void;
    handleSaveAddress: () => void;
}

const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

export default function AddressForm({
    formData,
    setFormData,
    showErrors,
    showAddressLine2,
    setShowAddressLine2,
    showLandmark,
    setShowLandmark,
    editingAddressId,
    setEditingAddressId,
    handleSaveAddress,
}: AddressFormProps) {
    const [isFetchingPincode, setIsFetchingPincode] = useState(false);
    const [postOffices, setPostOffices] = useState<any[]>([]);
    const [isPostOfficeDropdownOpen, setIsPostOfficeDropdownOpen] = useState(false);

    const handleSelectPostOffice = (office: any) => {
        const talukaOrName = office.Name || office.Block || '';
        setFormData(prev => ({
            ...prev,
            landmark: toTitleCase(talukaOrName),
            city: office.District ? toTitleCase(office.District) : prev.city,
            state: office.State ? toTitleCase(office.State) : prev.state,
        }));
        setShowLandmark(true);
        setIsPostOfficeDropdownOpen(false);
    };

    const fetchPincodeDetails = async (pincode: string) => {
        try {
            setIsFetchingPincode(true);
            setPostOffices([]);
            setIsPostOfficeDropdownOpen(false);
            const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await res.json();
            if (Array.isArray(data) && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                const officeList = data[0].PostOffice;
                setPostOffices(officeList);

                const firstOffice = officeList[0];
                const district = firstOffice.District || firstOffice.Block || firstOffice.Division || '';
                const state = firstOffice.State || '';

                setFormData(prev => ({
                    ...prev,
                    city: district ? toTitleCase(district) : prev.city,
                    state: state ? toTitleCase(state) : prev.state,
                }));

                setIsPostOfficeDropdownOpen(true);
            }
        } catch (err) {
            console.error('Failed to fetch pincode details', err);
        } finally {
            setIsFetchingPincode(false);
        }
    };

    return (
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
                        <input type="text" id="landmark" readOnly maxLength={45} value={formData.landmark} className="peer w-full border border-gray-300 rounded-md pr-10 sm:pr-12 px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm text-gray-700 hover:cursor-not-allowed focus:outline-none focus:border-gray-300 focus:ring-0" placeholder=" " />
                        <label htmlFor="landmark" className="absolute left-2 -top-0 bg-white px-1 text-xs text-gray-500 transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs peer-focus:text-gray-500 z-10 pointer-events-none">
                            Landmarks
                        </label>
                        <div className="absolute right-2 sm:right-3 top-[19px] sm:top-[22px] text-xs text-gray-400 pointer-events-none">
                            {45 - (formData.landmark?.length || 0)}
                        </div>
                    </div>
                ) : (
                    <div className="pt-1">
                        <button type="button" onClick={() => setShowLandmark(true)} className="text-[12px] sm:text-sm text-green-600 hover:underline text-left w-max cursor-pointer block">Add landmarks</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-3">
                    {/* 1. Postal Code */}
                    <div className="relative pt-2">
                        <input
                            type="text"
                            id="zip"
                            maxLength={6}
                            value={formData.zip}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 6) {
                                    if (val === '') {
                                        setFormData(prev => ({
                                            ...prev,
                                            zip: '',
                                            city: '',
                                            state: '',
                                            landmark: ''
                                        }));
                                        setPostOffices([]);
                                        setIsPostOfficeDropdownOpen(false);
                                    } else {
                                        setFormData(prev => ({ ...prev, zip: val }));
                                        if (val.length === 6) {
                                            fetchPincodeDetails(val);
                                        } else {
                                            setPostOffices([]);
                                            setIsPostOfficeDropdownOpen(false);
                                        }
                                    }
                                }
                            }}
                            className={`peer w-full border ${showErrors && formData.zip.length !== 6 ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm focus:outline-none ${showErrors && formData.zip.length !== 6 ? '' : 'focus:border-green-600 focus:ring-0.5 focus:ring-green-600'}`}
                            placeholder=" "
                        />
                        <label htmlFor="zip" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && formData.zip.length !== 6 ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-green-600'}`}>
                            Postal Code*
                        </label>
                        {isFetchingPincode && (
                            <div className="absolute right-2.5 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <div className="w-4 h-4 border-2 border-[#458500] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        {!isFetchingPincode && showErrors && formData.zip.length !== 6 && (
                            <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && formData.zip.length !== 6 && (
                            <p className="text-[#d32f2f] text-xs mt-1">
                                {!formData.zip ? 'Postal Code is required.' : 'Postal Code must be a 6-digit number.'}
                            </p>
                        )}
                    </div>

                    {/* 2. City */}
                    <div className="relative pt-2">
                        <input type="text" id="city" readOnly value={formData.city} className={`peer w-full border ${showErrors && !formData.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm text-gray-700 hover:cursor-not-allowed focus:outline-none focus:border-gray-300 focus:ring-0`} placeholder=" " />
                        <label htmlFor="city" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.city ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-gray-500'}`}>
                            City*
                        </label>
                        {showErrors && !formData.city && (
                            <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.city && <p className="text-[#d32f2f] text-xs mt-1">City is required.</p>}
                    </div>

                    {/* 3. State */}
                    <div className="relative pt-2">
                        <input type="text" id="state" readOnly value={formData.state} className={`peer w-full border ${showErrors && !formData.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-2 sm:px-3 py-2 sm:py-3 text-[13.5px] sm:text-sm text-gray-700 hover:cursor-not-allowed focus:outline-none focus:border-gray-300 focus:ring-0`} placeholder=" " />
                        <label htmlFor="state" className={`absolute left-2 -top-0 bg-white px-1 text-xs transition-all peer-placeholder-shown:top-[18px] sm:peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs sm:peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:-top-0 sm:peer-focus:-top-0 peer-focus:text-xs z-10 pointer-events-none ${showErrors && !formData.state ? 'text-red-500 peer-focus:text-red-500' : 'text-gray-500 peer-focus:text-gray-500'}`}>
                            State*
                        </label>
                        {showErrors && !formData.state && (
                            <div className="absolute right-2 sm:right-3 top-[18px] sm:top-[21px] pointer-events-none">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        )}
                        {showErrors && !formData.state && <p className="text-[#d32f2f] text-xs mt-1">State/Province/Territory/Region is required.</p>}
                    </div>
                </div>

                {postOffices.length > 0 && (
                    <div className="relative pt-1">
                        <label className="block text-[11px] sm:text-xs font-semibold text-[#458500] mb-1">
                            Select Area / Post Office ({postOffices.length} found for {formData.zip}):
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsPostOfficeDropdownOpen(prev => !prev)}
                                className="w-full text-left border border-[#458500]/50 bg-[#f9fbf7] hover:bg-[#edf4e8] rounded-md px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between transition-colors cursor-pointer shadow-sm"
                            >
                                <span className="truncate">
                                    {formData.landmark ? `Selected: ${formData.landmark}` : `Click to select Area / Post Office...`}
                                </span>
                                <svg className={`w-4 h-4 text-[#458500] transition-transform duration-200 shrink-0 ${isPostOfficeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isPostOfficeDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#458500]/30 rounded-md shadow-xl max-h-52 overflow-y-auto custom-scrollbar">
                                    <div className="p-1">
                                        {postOffices.map((office: any, idx: number) => {
                                            const isSelected = formData.landmark?.toLowerCase() === (office.Name || office.Block || '').toLowerCase();
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSelectPostOffice(office)}
                                                    className={`px-3 py-2 text-xs sm:text-sm cursor-pointer rounded transition-colors flex items-center justify-between border-b border-gray-100 last:border-0 ${isSelected ? 'bg-[#eef6e6] text-[#458500] font-bold' : 'hover:bg-gray-50 text-gray-800'}`}
                                                >
                                                    <div className="flex flex-col min-w-0 pr-2">
                                                        <span className="font-semibold text-gray-900 truncate">{office.Name}</span>
                                                        {office.Block && <span className="text-[11px] text-gray-500 font-normal">Taluka / Block: {office.Block}</span>}
                                                    </div>
                                                    <span className="text-[10px] text-[#458500] bg-[#eef6e6] border border-[#d4e5c5] px-2 py-0.5 rounded shrink-0 font-medium">{office.BranchType || 'Post Office'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
}
