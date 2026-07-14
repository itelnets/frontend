'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { updateBanner, BannerItem } from '../../../../../../services/banner';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import PageLoader from '@/components/PageLoader';
import Link from 'next/link';

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const bannerId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [banner, setBanner] = useState<BannerItem | null>(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/login');
            return;
        }
        loadBanner();
    }, [bannerId, router]);

    const loadBanner = async () => {
        setIsLoading(true);
        try {
            // We need to fetch the single banner. Wait, there's no getBannerById?
            // Let's get all banners and find it
            const { getBanners } = await import('../../../../../../services/banner');
            const data = await getBanners();
            const found = data.find(b => b._id === bannerId);
            if (found) {
                setBanner(found);
                setPreviewUrl(found.imageUrl);
            } else {
                toast.error('Banner not found');
                router.push('/admin/banners');
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
            toast.error('Failed to load banner');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
            toast.error('Please upload a JPG or PNG image.');
            return;
        }

        const img = new Image();
        img.onload = () => {
            if (img.width !== 1368 || img.height !== 260) {
                toast.error(`Image size must be 1368x260 pixels. Uploaded image is ${img.width}x${img.height} pixels.`);
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setImageDimensions({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            toast.error('Invalid image file.');
        };
        img.src = URL.createObjectURL(file);
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

    const handleCancel = () => {
        setIsCancelling(true);
        router.push('/admin/banners');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile && !banner) {
            toast.error('Please select a banner image');
            return;
        }

        try {
            setIsSaving(true);

            let newImageKey = banner?.imageKey;
            let newFileSize = banner?.fileSize;
            let newWidth = banner?.width;
            let newHeight = banner?.height;

            if (selectedFile) {
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
                newImageKey = uploadData.imageKey;
                newFileSize = selectedFile.size;
                newWidth = imageDimensions.width;
                newHeight = imageDimensions.height;
            }

            await updateBanner(bannerId, {
                imageKey: newImageKey,
                fileSize: newFileSize,
                width: newWidth,
                height: newHeight
            });

            toast.success('Banner updated successfully');
            router.push('/admin/banners');
        } catch (error) {
            console.error('Error updating banner:', error);
            toast.error('Failed to update banner');
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto bg-gray-50/50 min-h-screen">
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="bg-green-100 text-green-700 p-2 rounded-xl">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 11l6-6L20.486 8.486a2 2 0 010 2.828L11 20H4v-7z" />
                            </svg>
                        </span>
                        Edit Banner
                    </h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Update the banner image to be displayed on the homepage slider.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Banner Image <span className="text-gray-400 font-normal text-xs ml-2">(Size must be 1368 x 260)</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('banner-upload')?.click()}
                        >
                            <input
                                id="banner-upload"
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {previewUrl ? (
                                <div className="w-full relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <div className="aspect-[1368/260] w-full relative group/preview">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm shadow-md">Click or Drag to Replace</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 font-medium mb-1 group-hover:text-green-700 transition-colors">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">JPG or PNG only. (1368 x 260)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 sm:px-8 sm:py-5 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving || isCancelling}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isCancelling ? (
                            <>
                                <Spinner className="w-4 h-4 mr-2 border-gray-600" />
                            </>
                        ) : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || isCancelling || (!selectedFile && !banner)}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                    >
                        <span className={`flex items-center transition-opacity ${isSaving ? 'opacity-0' : 'opacity-100'}`}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Update Banner
                        </span>
                        {isSaving && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-700">
                                <Spinner className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
