'use client';

import React from 'react';
import AddressForm from './AddressForm';

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

interface AddressSectionProps {
    savedAddresses: any[];
    selectedAddressMode: string;
    setSelectedAddressMode: (mode: string) => void;
    editingAddressId: string | null;
    setEditingAddressId: (id: string | null) => void;
    handleEditClick: (e: React.MouseEvent, addr: any) => void;
    handleDeleteClick: (e: React.MouseEvent, id: string) => void;
    handleSetDefault: (e: React.MouseEvent, id: string) => void;
    handleSaveAddress: () => void;
    checkoutStep: number;
    router: any;
    setIsAddressModalOpen: (open: boolean) => void;
    formData: AddressFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
    showErrors: boolean;
    showAddressLine2: boolean;
    setShowAddressLine2: (show: boolean) => void;
    showLandmark: boolean;
    setShowLandmark: (show: boolean) => void;
}

export default function AddressSection({
    savedAddresses,
    selectedAddressMode,
    setSelectedAddressMode,
    editingAddressId,
    setEditingAddressId,
    handleEditClick,
    handleDeleteClick,
    handleSetDefault,
    handleSaveAddress,
    checkoutStep,
    router,
    setIsAddressModalOpen,
    formData,
    setFormData,
    showErrors,
    showAddressLine2,
    setShowAddressLine2,
    showLandmark,
    setShowLandmark,
}: AddressSectionProps) {
    return (
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

                    {editingAddressId === addr._id && (
                        <AddressForm
                            formData={formData}
                            setFormData={setFormData}
                            showErrors={showErrors}
                            showAddressLine2={showAddressLine2}
                            setShowAddressLine2={setShowAddressLine2}
                            showLandmark={showLandmark}
                            setShowLandmark={setShowLandmark}
                            editingAddressId={editingAddressId}
                            setEditingAddressId={setEditingAddressId}
                            handleSaveAddress={handleSaveAddress}
                        />
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
                    <span className="font-bold text-gray-900 text-[14px] sm:text-[18px] leading-none">Add shipping address</span>
                </div>

                {selectedAddressMode === 'new' && editingAddressId === 'new' && (
                    <AddressForm
                        formData={formData}
                        setFormData={setFormData}
                        showErrors={showErrors}
                        showAddressLine2={showAddressLine2}
                        setShowAddressLine2={setShowAddressLine2}
                        showLandmark={showLandmark}
                        setShowLandmark={setShowLandmark}
                        editingAddressId={editingAddressId}
                        setEditingAddressId={setEditingAddressId}
                        handleSaveAddress={handleSaveAddress}
                    />
                )}
                {selectedAddressMode === 'new' && editingAddressId !== 'new' && (
                    <div className="mt-4 sm:ml-8 flex justify-end">
                        <button type="button" onClick={() => { setEditingAddressId('new'); setFormData({ fullName: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', zip: '', phone: '', isDefault: false }); }} className="bg-[#458500] hover:bg-[#366800] text-white font-normal py-2 sm:py-3 px-6 sm:px-12 rounded-md transition-colors font-bold mb-2 sm:mb-4 text-[14px] sm:text-[16px] cursor-pointer">
                            Fill New Address Form
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
