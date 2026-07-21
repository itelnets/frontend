'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBanners, createBanner, deleteBanner, BannerItem, updateBanner, reorderBanners } from '../../../../services/banner';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import Spinner from '@/components/Spinner';
import PageLoader from '@/components/PageLoader';

import { formatDate } from '@/utils/formatDate';

export default function BannersPage() {
    const router = useRouter();
    const [banners, setBanners] = useState<BannerItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);



    // Modal state for viewing full image
    const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('adminInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/login');
            return;
        }
        loadBanners();
    }, [router]);

    const loadBanners = async () => {
        try {
            setIsLoading(true);
            const data = await getBanners();
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to load banners');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        processFile(files[0]);
        e.target.value = ''; // Reset
    };

    const processFile = (file: File) => {
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedExtensions.includes(fileExtension)) {
            toast.error('Invalid file format. Only JPG, JPEG, and PNG formats are supported.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(`Image size must be less than 5MB`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (img.width !== 1368 || img.height !== 260) {
                    toast.error(`Image dimensions must be exactly 1368 x 260 px. Got: ${img.width} x ${img.height} px.`);
                    setSelectedFile(null);
                    setPreviewUrl('');
                    return;
                }
                setImageDimensions({ width: img.width, height: img.height });
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Please select a banner image');
            return;
        }

        try {
            setIsUploading(true);

            const fileData = new FormData();
            fileData.append('image', selectedFile);

            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload?type=banner`, {
                method: 'POST',
                body: fileData
            });

            if (!uploadRes.ok) {
                throw new Error('Image upload failed');
            }

            const uploadData = await uploadRes.json();
            const imageKey = uploadData.imageKey;

            const newBanner = await createBanner(
                imageKey,
                selectedFile.size,
                imageDimensions.width,
                imageDimensions.height
            );

            setBanners(prev => [newBanner, ...prev]);
            toast.success('Banner uploaded successfully');

            setSelectedFile(null);
            setPreviewUrl('');
            setImageDimensions({ width: 0, height: 0 });
        } catch (error) {
            console.error('Error uploading banner:', error);
            toast.error('Failed to upload banner');
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDelete = async () => {
        if (!bannerToDelete) return;
        setIsDeleting(true);
        try {
            await deleteBanner(bannerToDelete);
            setBanners(prev => prev.filter(b => b._id !== bannerToDelete));
            toast.success('Banner deleted successfully');
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Failed to delete banner');
        } finally {
            setIsDeleting(false);
            setBannerToDelete(null);
        }
    };

    // (no inline edit or toggle handlers needed)

    const onDragStart = (e: React.DragEvent, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', index.toString()); } catch (err) { }
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const onDrop = async (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const fromIndex = dragIndex !== null ? dragIndex : parseInt(e.dataTransfer.getData('text/plain') || '-1', 10);
        const toIndex = index;
        setDragIndex(null);
        setDragOverIndex(null);

        if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

        const updated = [...banners];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setBanners(updated);

        // persist new order
        try {
            const ids = updated.map(u => u._id);
            await reorderBanners(ids);
            toast.success('Order saved');
        } catch (error) {
            console.error('Error saving order:', error);
            toast.error('Failed to save new order');
            // reload to revert
            loadBanners();
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    if (isLoading || isUploading) {
        return <PageLoader />;
    }

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto select-none">
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Homepage Banners</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Upload and manage promotional slides for the store header.</p>
                </div>
                <span className="inline-flex items-center w-fit gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200/50">
                    Required Size: 1368 x 260 px | JPG, JPEG, PNG
                </span>
            </div>

            {/* Compact, Space-Optimized Banner upload form */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-xs max-w-4xl">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

                    {/* Compact Drag & Drop Upload Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('banner-file-input')?.click()}
                        className={`border-2 border-dashed rounded-lg px-4 py-3 text-center cursor-pointer transition-all flex items-center justify-center gap-3 flex-1 min-h-[64px] ${isDragging
                            ? 'border-green-600 bg-green-50/20'
                            : 'border-gray-300 hover:border-green-500 bg-gray-50/40 hover:bg-gray-50/80'
                            }`}
                    >
                        <input
                            id="banner-file-input"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-700 font-semibold truncate">
                            {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop image here, or browse'}
                        </span>
                    </div>

                    {/* Accurate Aspect Ratio Preview Box (Compact) */}
                    {previewUrl && (
                        <div className="w-44 aspect-[1368/260] rounded-lg overflow-hidden border border-gray-300 bg-gray-100 shadow-xs shrink-0 self-center">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Upload action button */}
                    <button
                        type="submit"
                        disabled={isUploading || !selectedFile}
                        className={`rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors text-xs shrink-0 min-w-[140px] py-2.5 px-6 ${isUploading ? 'bg-green-600 text-white hover:bg-green-600' : selectedFile ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {isUploading ? (
                            <Spinner className="w-4 h-4 text-white animate-spin" />
                        ) : (
                            <span>Upload Banner</span>
                        )}
                    </button>
                </div>
            </form>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded Banners</h3>

                {banners.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-xs">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No banners found</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Upload images to display in the homepage slider carousel.</p>
                    </div>
                ) : (
                    <div className="bg-transparent sm:bg-white sm:border sm:border-gray-200 sm:rounded-xl overflow-hidden sm:shadow-xs">
                        <div className="overflow-hidden sm:overflow-x-auto w-full pb-2 sm:pb-0">
                            <table className="min-w-full divide-y divide-gray-200 block sm:table">
                                <thead className="bg-gray-50 hidden sm:table-header-group">
                                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                                        <th className="p-4">Preview (Click to enlarge)</th>
                                        <th className="p-4">File Size</th>
                                        <th className="p-4 hidden sm:table-cell">Created</th>
                                        <th className="p-4 hidden sm:table-cell">Updated</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 text-sm block sm:table-row-group">
                                    {banners.map((banner, idx) => (
                                        <tr key={banner._id} className="hover:bg-gray-50 transition-colors grid grid-cols-1 sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none" draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} onDrop={(e) => onDrop(e, idx)}>
                                            {/* Preview Cell - Click to Enlarge */}
                                            <td className="p-3 sm:p-4 block sm:table-cell sm:border-0">
                                                <div className="flex justify-between items-start">
                                                    <div
                                                        onClick={() => setActiveModalImage(banner.imageUrl)}
                                                        className="w-36 aspect-[1368/260] bg-gray-150 rounded border border-gray-200 overflow-hidden cursor-zoom-in hover:opacity-90 active:scale-[0.98] transition-all relative group"
                                                        title="Click to view full banner"
                                                    >
                                                        <img
                                                            src={banner.imageUrl}
                                                            alt="Thumbnail"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Mobile Actions in the same row as image on the right top */}
                                                    <div className="flex sm:hidden items-center justify-end gap-1.5">
                                                        <span className="text-[12px] font-bold text-green-700 mr-2">{formatBytes(banner.fileSize || 0)}</span>
                                                        <Link href={`/admin/banners/edit/${banner._id}`} title="Edit" className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </Link>
                                                        <button onClick={() => setBannerToDelete(banner._id)} title="Delete" className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors cursor-pointer shadow-sm">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Mobile Compact Data Row */}
                                            <td className="px-3 pb-3 pt-0 sm:hidden block border-b sm:border-0 border-gray-100">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <span className="text-[9px] font-semibold text-gray-400 uppercase">Created: </span>
                                                            <span className="text-[10px] font-medium text-gray-700">{formatDate(banner.createdAt)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-semibold text-gray-400 uppercase">Updated: </span>
                                                            <span className="text-[10px] font-medium text-gray-700">{formatDate(banner.updatedAt || banner.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Desktop File Size Cell */}
                                            <td className="p-4 text-gray-600 font-medium whitespace-nowrap hidden sm:table-cell">
                                                {formatBytes(banner.fileSize || 0)}
                                            </td>
                                            {/* Uploaded Date Cell */}
                                            <td className="p-4 hidden sm:table-cell text-gray-500 whitespace-nowrap">
                                                {formatDate(banner.createdAt)}
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-gray-500 whitespace-nowrap">
                                                {formatDate(banner.updatedAt || banner.createdAt)}
                                            </td>
                                            {/* Desktop Delete Action Cell */}
                                            <td className="p-4 text-right hidden sm:table-cell">
                                                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                                    <Link href={`/admin/banners/edit/${banner._id}`} title="Edit" className="inline-flex items-center justify-center p-1.5 sm:p-2 border border-transparent rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button onClick={() => setBannerToDelete(banner._id)} title="Delete" className="inline-flex items-center justify-center p-1.5 sm:p-2 border border-transparent rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors cursor-pointer shadow-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Full-screen Responsive Image Popup Modal */}
            {activeModalImage && (
                <div
                    onClick={() => setActiveModalImage(null)}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 cursor-zoom-out animate-fadeIn"
                >
                    <div className="relative max-w-5xl w-full flex flex-col items-center">
                        <div
                            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking the image container itself
                            className="w-full aspect-[1368/260] bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative"
                        >
                            <img
                                src={activeModalImage}
                                alt="Full Banner Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!bannerToDelete}
                title="Delete banner?"
                description="Are you sure you want to delete this product permanently?"
                onCancel={() => setBannerToDelete(null)}
                onConfirm={confirmDelete}
                cancelText="Cancel"
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
