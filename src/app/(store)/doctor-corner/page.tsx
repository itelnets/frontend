"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { submitDoctorRequest, getDoctorStatus } from '@/services/doctor';
import DoctorCornerStatusCards from './DoctorCornerStatusCards';

export default function DoctorCornerPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [doctorRequest, setDoctorRequest] = useState<any>(null);

    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        registrationNumber: '',
        specialization: '',
        hospitalClinic: '',
        documentUrl: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const infoStr = localStorage.getItem('userInfo') || localStorage.getItem('user');
        if (infoStr) {
            try {
                const parsed = JSON.parse(infoStr);
                const currentUser = parsed.user || parsed;
                setUser(currentUser);
                setFormData(prev => ({
                    ...prev,
                    name: currentUser.name || parsed.name || '',
                    email: currentUser.email || parsed.email || '',
                    mobileNumber: currentUser.mobileNumber || parsed.mobileNumber || ''
                }));
                fetchDoctorStatus();
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchDoctorStatus = async () => {
        try {
            const data = await getDoctorStatus();
            if (data && data.doctorRequest) {
                setDoctorRequest(data.doctorRequest);
            }
        } catch (error) {
            console.error('Failed to fetch doctor status', error);
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
        if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Medical registration/certificate number is required';
        if (!formData.specialization.trim()) errors.specialization = 'Specialization is required';
        if (!formData.hospitalClinic.trim()) errors.hospitalClinic = 'Hospital / Clinic Name is required';
        if (!formData.documentUrl.trim()) errors.documentUrl = 'Medical Certificate upload is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDoc(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);

            const infoStr = localStorage.getItem('userInfo') || localStorage.getItem('user');
            let token = '';
            if (infoStr) {
                try {
                    const parsed = JSON.parse(infoStr);
                    token = parsed.token || '';
                } catch (err) { }
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/upload?type=doctor`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: uploadFormData
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Document upload failed');
            }
            const data = await res.json();
            const docPath = data.imageUrl || data.imageKey || data.url;
            setFormData(prev => ({ ...prev, documentUrl: docPath }));
            setFormErrors(prev => ({ ...prev, documentUrl: '' }));
            toast.success('Certificate uploaded successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload certificate file');
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleRemoveCertificate = async () => {
        if (!formData.documentUrl) return;
        const fileUrl = formData.documentUrl;
        setFormData(prev => ({ ...prev, documentUrl: '' }));
        try {
            const userInfo = localStorage.getItem('userInfo');
            const token = userInfo ? JSON.parse(userInfo).token : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

            await fetch(`${apiUrl}/upload`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ fileUrl })
            });
            toast.success('Certificate file deleted');
        } catch (err) {
            console.error('Failed deleting file from S3:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to submit doctor verification');
            router.push('/login?redirect=/doctor-corner');
            return;
        }

        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await submitDoctorRequest(formData);
            toast.success(res.message || 'Verification request submitted successfully!');
            setDoctorRequest(res.doctorRequest);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit doctor request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Promo code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center items-center min-h-[350px] sm:min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-[#458500] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Loading Doctor Corner...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 py-3 px-3 sm:py-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

                {/* Hero Header */}
                <div className="bg-gradient-to-r from-[#2c5600] via-[#458500] to-[#599e0b] rounded-lg px-2.5 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                        <div className="flex justify-center sm:justify-end">
                            <span className="inline-flex items-center gap-1.5 bg-yellow-400 text-gray-900 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide shadow-sm">
                                🎁 Special Doctor Discount Available
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Doctor Corner</h1>

                        <p className="text-xs sm:text-sm lg:text-base text-green-100 max-w-2xl leading-relaxed">
                            Exclusive discounts and specialized healthcare benefits for verified medical practitioners & doctors.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                {!user ? (
                    /* State: Unauthenticated User ONLY -> Show Login & Create Account buttons */
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-xs text-center space-y-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 text-[#458500] rounded-full flex items-center justify-center mx-auto text-xl sm:text-2xl">
                            👨‍⚕️
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Are you a registered Doctor?</h2>
                        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                            Sign in to verify your medical council registration and unlock exclusive doctor promo codes & discounts.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 pt-2 max-w-xs sm:max-w-none mx-auto">
                            <Link
                                href="/login?redirect=/doctor-corner"
                                className="bg-[#458500] hover:bg-[#366800] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-xs sm:text-sm text-center"
                            >
                                Login to Apply
                            </Link>
                            <Link
                                href="/register?redirect=/doctor-corner"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-2.5 rounded-lg transition-colors text-xs sm:text-sm text-center"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                ) : doctorRequest && (doctorRequest.status === 'pending' || doctorRequest.status === 'approved') ? (
                    <DoctorCornerStatusCards
                        doctorRequest={doctorRequest}
                        copied={copied}
                        onCopyCode={handleCopyCode}
                    />
                ) : (
                    /* State: Logged-in User -> Form for Verification & Certificate Upload */
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
                        {doctorRequest && doctorRequest.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 sm:p-4 text-red-800 text-xs sm:text-sm space-y-1">
                                <span className="font-bold block">Previous Verification Request Rejected</span>
                                <p className="text-xs text-red-700">
                                    {doctorRequest.adminNotes || 'Please check your registration details and re-submit for verification.'}
                                </p>
                            </div>
                        )}

                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Doctor Verification</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Please enter your medical registration number and upload your certificate document to request verification.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {/* Left Column: 3 Account Info Fields */}
                                <div className="space-y-3.5 sm:space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">1. Account Details</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            disabled
                                            value={formData.name}
                                            className="w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-100 border border-gray-200 text-gray-600 rounded-lg cursor-not-allowed select-none font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            readOnly
                                            disabled
                                            value={formData.email}
                                            className="w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-100 border border-gray-200 text-gray-600 rounded-lg cursor-not-allowed select-none font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            disabled
                                            value={formData.mobileNumber}
                                            className="w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-100 border border-gray-200 text-gray-600 rounded-lg cursor-not-allowed select-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: 3 Doctor Specification Inputs */}
                                <div className="space-y-3.5 sm:space-y-4">
                                    <h3 className="text-xs font-bold text-[#458500] uppercase tracking-wider">2. Medical Verification</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Medical Reg No <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. GMC-123456"
                                            value={formData.registrationNumber}
                                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                            className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border ${formErrors.registrationNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#458500]'} rounded-lg focus:outline-none transition-colors`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Specialization <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. General Physician, Pediatrician"
                                            value={formData.specialization}
                                            onChange={(e) => {
                                                const titleCased = e.target.value.replace(/\b\w/g, (m) => m.toUpperCase());
                                                setFormData({ ...formData, specialization: titleCased });
                                            }}
                                            className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border ${formErrors.specialization ? 'border-red-500' : 'border-gray-300 focus:border-[#458500]'} rounded-lg focus:outline-none transition-colors capitalize`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Hospital / Clinic Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. City Health Clinic"
                                            value={formData.hospitalClinic}
                                            onChange={(e) => {
                                                const titleCased = e.target.value.replace(/\b\w/g, (m) => m.toUpperCase());
                                                setFormData({ ...formData, hospitalClinic: titleCased });
                                            }}
                                            className={`w-full px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border ${formErrors.hospitalClinic ? 'border-red-500' : 'border-gray-300 focus:border-[#458500]'} rounded-lg focus:outline-none transition-colors capitalize`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Medical Certificate Upload Section */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Upload Medical / License Document <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-row items-center gap-1 sm:gap-2">
                                    {/* Left Side: Upload Button (Fixed dimensions: standard height, fixed width during/before upload) */}
                                    <label className="w-[80px] sm:w-[100px] h-[32px] sm:h-[36px] bg-[#458500] hover:bg-[#366800] text-white font-bold rounded-md text-xs sm:text-sm cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs">
                                        {uploadingDoc ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <span>Upload</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*,.pdf" onChange={handleDocFileUpload} className="hidden" disabled={uploadingDoc} />
                                    </label>

                                    {formData.documentUrl && (
                                        <div className="flex-1 w-full h-[44px] sm:h-[48px] flex items-center justify-start border border-dashed border-gray-200 bg-gray-50 rounded-lg px-3">
                                            <div className="flex items-center justify-between w-full gap-3">
                                                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate max-w-[150px] sm:max-w-[240px]">
                                                    {formData.documentUrl.split('/').pop() || 'Uploaded Certificate'}
                                                </span>
                                                <div className="relative shrink-0 pr-1">
                                                    {formData.documentUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || formData.documentUrl.startsWith('data:image') || !formData.documentUrl.toLowerCase().endsWith('.pdf') ? (
                                                        <img
                                                            src={formData.documentUrl.startsWith('http') ? formData.documentUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload/file/${formData.documentUrl}`}
                                                            alt="Certificate Preview"
                                                            className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-lg shadow-xs"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 text-red-700 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs">
                                                            PDF
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveCertificate}
                                                        title="Remove certificate"
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md z-10"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {formErrors.documentUrl && !formData.documentUrl && (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.documentUrl}</p>
                                )}
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting || uploadingDoc}
                                    className="w-full sm:w-auto min-w-[90px] sm:min-w-[110px] h-[34px] sm:h-[40px] bg-[#458500] hover:bg-[#366800] text-white font-bold px-4 sm:px-8 rounded-md shadow-sm transition-colors cursor-pointer text-xs sm:text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
