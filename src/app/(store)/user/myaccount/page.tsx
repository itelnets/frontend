'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { getProfile, updateProfile, requestEmailChange, verifyEmailChange, forgotPassword, deleteAccount } from '@/services/user';
import toast from 'react-hot-toast';

export default function MyAccountPage() {
    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // OTP state for email change
    const [isAwaitingOtp, setIsAwaitingOtp] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const router = useRouter();

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            await deleteAccount();

            localStorage.removeItem('userInfo');
            window.dispatchEvent(new Event('userInfoUpdated'));
            toast.success('Account deleted successfully');
            router.push('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    useEffect(() => {
        const loadProfileData = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                try {
                    const freshProfile = await getProfile('addresses');
                    if (freshProfile) {
                        const { addresses: fetchedAddresses, ...profileData } = freshProfile;
                        const updatedUserInfo = { ...parsedUser, ...profileData, addresses: fetchedAddresses, token: parsedUser.token };
                        setUser(updatedUserInfo);
                        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                        window.dispatchEvent(new Event('userInfoUpdated'));

                        if (fetchedAddresses) {
                            setAddresses(Array.isArray(fetchedAddresses) ? fetchedAddresses : []);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user data', error);
                }
            } else {
                router.push('/login');
            }
            setIsLoading(false);
        };
        loadProfileData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Spinner className="w-8 h-8 sm:w-12 sm:h-12 text-[#458500]" />
            </div>
        );
    }

    if (!user) return null;

    const maskEmail = (email: string) => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        if (!domain) return email;
        if (name.length <= 2) return `${name[0]}***@${domain}`;
        return `${name[0]}***${name[name.length - 1]}@${domain}`;
    };

    const maskPhone = (phone: string) => {
        if (!phone) return '';
        if (phone.length <= 6) return phone;
        return `${phone.slice(0, 5)}***${phone.slice(-3)}`;
    };

    const handleConfirmReset = async () => {
        try {
            setIsResetting(true);
            const promise = forgotPassword(user.email);
            toast.promise(promise, {
                loading: 'Sending password reset link',
                success: 'Password reset link sent to your email!',
                error: (err: any) => err.response?.data?.message || 'Failed to send reset link',
            });
            await promise;
        } catch (error) {
            console.error(error);
        } finally {
            setIsResetting(false);
            setShowResetModal(false);
        }
    };

    const handleEdit = async (section: any) => {
        if (!section.editable) return;

        // Special case for shipping address - redirect to checkout
        if (section.id === 'shipping') {
            router.push('/checkout');
            return;
        }

        // Special case for password - trigger forgot password flow
        if (section.id === 'password') {
            setShowResetModal(true);
            return;
        }

        setEditingId(section.id);
        setIsAwaitingOtp(false);
        setOtpValue('');
        // Extract raw value for editing, not masked or formatted
        if (section.id === 'name') setEditValue(user.name || '');
        else if (section.id === 'phone') {
            const rawPhone = user.mobileNumber || user.phone || '';
            setEditValue(rawPhone.replace(/^\+?91\s*/, '').replace(/\D/g, ''));
        }
        else if (section.id === 'email') setEditValue(user.email || '');
        else setEditValue('');
    };

    const handleSave = async (id: string) => {
        try {
            setIsSaving(true);

            if (id === 'email') {
                // Request email change OTP
                await requestEmailChange(editValue);
                setIsAwaitingOtp(true);
                toast.success(`OTP sent to ${editValue}`);
                setIsSaving(false);
                return; // Stop here and wait for OTP verification
            }

            const payload: any = {};
            if (id === 'name') {
                if (editValue.trim().length < 10) {
                    toast.error('Name must be at least 10 characters');
                    setIsSaving(false);
                    return;
                }
                payload.name = editValue.trim();
            }
            if (id === 'phone') {
                const digits = editValue.replace(/\D/g, '');
                if (digits.length !== 10) {
                    toast.error('Mobile number must be exactly 10 digits');
                    setIsSaving(false);
                    return;
                }
                payload.mobileNumber = '+91 ' + digits;
            }

            const updatedUser = await updateProfile(payload);
            console.log("updatedUser from API:", updatedUser);

            const newUserInfo = { ...user, ...updatedUser, token: user.token };
            if (payload.name) newUserInfo.name = payload.name;
            if (payload.mobileNumber) newUserInfo.mobileNumber = payload.mobileNumber;
            
            console.log("newUserInfo before set:", newUserInfo);
            setUser(newUserInfo);
            localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
            window.dispatchEvent(new Event('userInfoUpdated'));

            toast.success('Profile updated successfully!');
            setEditingId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length < 4) {
            toast.error('Please enter a valid OTP');
            return;
        }

        try {
            setIsSaving(true);
            const data = await verifyEmailChange(otpValue);

            const newUserInfo = { ...user, ...data.user, token: user.token };
            setUser(newUserInfo);
            localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
            window.dispatchEvent(new Event('userInfoUpdated'));

            toast.success('Email updated successfully!');
            setEditingId(null);
            setIsAwaitingOtp(false);
            setOtpValue('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsSaving(false);
        }
    };

    const renderAddresses = () => {
        if (addresses.length === 0) {
            return <div className="text-gray-500 mt-1 italic">No addresses saved.</div>;
        }

        return (
            <div className="flex flex-col gap-2 sm:gap-4 mt-2">
                {addresses.map((address, index) => (
                    <div
                        key={address._id || index}
                        className="text-[11px] sm:text-[13px] text-gray-600 leading-tight border border-[#d4e5c5] rounded-md p-2.5 sm:p-3 bg-[#eef6e6] relative cursor-pointer hover:shadow-sm transition-shadow hover:border-[#a9c990]"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push('/checkout');
                        }}
                    >
                        {address.isDefault && (
                            <span className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-3 text-[10px] font-bold bg-white text-[#458500] border border-[#d4e5c5] px-2 py-1.5 rounded-md">DEFAULT</span>
                        )}
                        <div className="font-semibold text-[12px] sm:text-[14px] text-gray-800 mb-0.5 sm:mb-1">{address.fullName}</div>
                        <div>{address.addressLine1},</div>
                        <div>{address.addressLine2}{address.addressLine2 ? ' - ' : ''}{address.zip},</div>
                        <div>{address.landmark ? address.landmark + ', ' : ''}{address.city}, {address.state}, India</div>
                    </div>
                ))}
            </div>
        );
    };

    const profileSections = [
        {
            id: 'name',
            title: 'Name',
            value: user.name || '',
            editable: true,
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
        {
            id: 'phone',
            title: 'Mobile Number',
            value: maskPhone(user.mobileNumber || user.phone || ''),
            editable: true,
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        },
        {
            id: 'email',
            title: 'Email Address',
            value: maskEmail(user.email),
            editable: true, // Now editable!
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        },
        {
            id: 'password',
            title: 'Reset Password',
            value: '••••••••',
            editable: true, // Now triggers reset link!
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        },

        {
            id: 'shipping',
            title: 'Shipping Address',
            editable: true,
            value: renderAddresses(),
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        {
            id: 'delete_account',
            title: 'Delete Account',
            value: '',
            editable: true,
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        },
        {
            id: 'billing',
            title: 'Billing address',
            value: '',
            editable: false,
            icon: <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z M12 14a2 2 0 100-4 2 2 0 000 4z" /></svg>
        }
    ];

    return (
        <div className="bg-white rounded-none sm:rounded-lg shadow-sm border border-[#458500]/20 overflow-hidden">
            <div className="flex flex-col">
                {profileSections.map((section, idx) => {
                    const isEditing = editingId === section.id;

                    return (
                        <div
                            key={section.id}
                            className={`flex items-start justify-between py-2.5 px-2.5 sm:px-4 sm:py-3 sm:px-5 transition-colors ${section.editable ? 'hover:bg-gray-50' : 'cursor-not-allowed'} ${section.editable && section.id !== 'shipping' && section.id !== 'password' && section.id !== 'delete_account' ? 'cursor-pointer group' : section.id === 'shipping' || section.id === 'password' || section.id === 'delete_account' ? 'group' : ''} ${idx !== profileSections.length - 1 ? 'border-b border-[#458500]/20' : ''}`}
                            onClick={() => {
                                // Only trigger row click if it's not shipping, password, or delete_account
                                if (!isEditing && section.id !== 'shipping' && section.id !== 'password' && section.id !== 'delete_account') handleEdit(section);
                            }}
                        >
                            <div className="flex items-start gap-2.5 sm:gap-5 w-full">
                                <div className="pt-0.5 sm:pt-1 text-gray-400 shrink-0">
                                    {section.icon}
                                </div>

                                <div className="flex flex-col w-full">
                                    <span className="text-[12px] sm:text-[15px] font-bold text-gray-700">{section.title}</span>

                                    {isEditing ? (
                                        <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-3">
                                            {isAwaitingOtp && section.id === 'email' ? (
                                                <div className="flex flex-col gap-2 w-full max-w-sm">
                                                    <span className="text-xs text-[#458500] font-medium">OTP sent to {editValue}</span>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="Enter OTP"
                                                            value={otpValue}
                                                            onChange={(e) => setOtpValue(e.target.value)}
                                                            className="border border-gray-300 rounded-md h-[28px] sm:h-auto px-2 py-1 sm:px-3 sm:py-1.5 text-[12px] sm:text-sm w-full focus:outline-none focus:border-[#458500]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleVerifyOtp(); }}
                                                            disabled={isSaving}
                                                            className="bg-[#458500] text-white h-[28px] sm:h-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[12px] sm:text-sm font-medium hover:bg-[#366800] disabled:opacity-70 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                                                        >
                                                            {isSaving ? 'Verifying...' : 'Verify'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingId(null); setIsAwaitingOtp(false); setOtpValue(''); }}
                                                            disabled={isSaving}
                                                            className="bg-gray-200 text-gray-700 h-[28px] sm:h-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[12px] sm:text-sm font-medium hover:bg-gray-300 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {section.id === 'phone' ? (
                                                        <div className="relative w-full max-w-sm flex items-center">
                                                            <span className="absolute left-2 sm:left-3 text-[12px] sm:text-sm text-gray-500 font-medium">+91</span>
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                placeholder="Enter Mobile Number"
                                                                value={editValue}
                                                                onChange={(e) => {
                                                                    let val = e.target.value.replace(/\D/g, '');
                                                                    if (val.length > 10) val = val.slice(0, 10);
                                                                    setEditValue(val);
                                                                }}
                                                                className="border border-gray-300 rounded-md h-[28px] sm:h-auto pl-[32px] sm:pl-[40px] pr-2 py-1 sm:pr-3 sm:py-1.5 text-[12px] sm:text-sm w-full focus:outline-none focus:border-[#458500]"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder={`Enter ${section.title}`}
                                                            value={editValue}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (section.id === 'name') {
                                                                    val = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                                                                }
                                                                setEditValue(val);
                                                            }}
                                                            className="border border-gray-300 rounded-md h-[28px] sm:h-auto px-2 py-1 sm:px-3 sm:py-1.5 text-[12px] sm:text-sm w-full max-w-sm focus:outline-none focus:border-[#458500]"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleSave(section.id); }}
                                                        disabled={isSaving}
                                                        className="relative bg-[#458500] text-white h-[28px] sm:h-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[12px] sm:text-sm font-medium hover:bg-[#366800] disabled:opacity-70 transition-colors shrink-0 whitespace-nowrap cursor-pointer flex items-center justify-center"
                                                    >
                                                        <span className={isSaving ? "invisible" : ""}>
                                                            {section.id === 'email' ? 'Send OTP' : 'Save'}
                                                        </span>
                                                        {isSaving && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingId(null); setIsAwaitingOtp(false); }}
                                                        disabled={isSaving}
                                                        className="bg-gray-200 text-gray-700 h-[28px] sm:h-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[12px] sm:text-sm font-medium hover:bg-gray-300 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        section.value && (
                                            <div className="text-[11px] sm:text-[14px] text-gray-500 mt-0.5 sm:mt-1">
                                                {section.value}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Action Area - Only show if editable and NOT currently editing */}
                            {section.editable && !isEditing && (
                                <div
                                    className={`pt-0.5 sm:pt-1 pl-2.5 sm:pl-3 flex-shrink-0 ${section.id !== 'password' ? 'cursor-pointer' : ''}`}
                                    onClick={(e) => {
                                        if (section.id === 'shipping' || section.id === 'password') {
                                            e.stopPropagation();
                                            handleEdit(section);
                                        }
                                    }}
                                >
                                    {section.id === 'password' ? (
                                        <button className="bg-[#458500] text-white h-[28px] sm:h-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[12px] sm:text-sm font-medium hover:bg-[#366800] transition-colors shrink-0 whitespace-nowrap cursor-pointer">
                                            Reset
                                        </button>
                                    ) : section.id === 'delete_account' ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowDeleteModal(true); }}
                                            className="bg-red-600 text-white h-[28px] sm:h-auto px-3 py-1 sm:px-4 sm:py-1.5 rounded-md text-[12px] sm:text-sm font-bold hover:bg-red-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer">
                                            Delete
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            {section.id === 'name' && !user.name && <span className="w-2 h-2 rounded-full bg-[#458500]"></span>}
                                            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 group-hover:text-gray-600 transition-colors cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm sm:max-w-md mx-auto overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Delete Account</h3>
                            <p className="text-[12px] sm:text-[14px] text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                                Are you sure you want to delete your account? This action is permanently deleted your all your data.
                            </p>
                            <div className="flex gap-2 sm:gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center justify-center min-w-[70px] sm:min-w-[80px] cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        'Confirm'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm sm:max-w-md mx-auto overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Reset Password</h3>
                            <p className="text-[12px] sm:text-[14px] text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                                Are you sure you want to send a password reset link to <strong>{user.email}</strong>?
                            </p>
                            <div className="flex gap-2 sm:gap-3 justify-end">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    disabled={isResetting}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmReset}
                                    disabled={isResetting}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-sm font-medium text-white bg-[#458500] hover:bg-[#366800] rounded-md transition-colors flex items-center justify-center min-w-[70px] sm:min-w-[80px] cursor-pointer"
                                >
                                    {isResetting ? (
                                        <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        'Send Link'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
