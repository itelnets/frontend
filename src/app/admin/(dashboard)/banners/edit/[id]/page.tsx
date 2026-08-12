'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { updateBanner, BannerItem } from '../../../../../../services/banner';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import PageLoader from '@/components/PageLoader';

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const bannerId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [banner, setBanner] = useState<BannerItem | null>(null);

    // Text states
    const [tabTitle, setTabTitle] = useState('');
    const [tabSubtitle, setTabSubtitle] = useState('');

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('adminInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/admin/login');
            return;
        }
        loadBanner();
    }, [bannerId, router]);

    const loadBanner = async () => {
        setIsLoading(true);
        try {
            const { getBanners } = await import('../../../../../../services/banner');
            const data = await getBanners();
            const found = data.find(b => b._id === bannerId);
            if (found) {
                setBanner(found);
                setPreviewUrl(found.imageUrl);
                setTabTitle(found.tabTitle || '');
                setTabSubtitle(found.tabSubtitle || '');
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
                newImageKey = uploadData.imageUrl;
                newFileSize = selectedFile.size;
                newWidth = imageDimensions.width;
                newHeight = imageDimensions.height;
            }

            await updateBanner(bannerId, {
                imageKey: newImageKey,
                fileSize: newFileSize,
                width: newWidth,
                height: newHeight,
                tabTitle,
                tabSubtitle
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
        <div className="flex-1 w-full min-h-[calc(100vh-100px)] flex flex-col justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto bg-gray-50/50">
            <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-[20px] sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        Edit Banner
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Update the banner image and text to be displayed on the homepage slider.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Banner Image <span className="text-gray-400 font-normal text-xs ml-2">(Size must be 1368 x 260)</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ease-in-out cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}
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
                                <div className="py-6">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 font-medium text-sm mb-0.5 group-hover:text-green-700 transition-colors">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">JPG or PNG only. (1368 x 260)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Text Information */}
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Banner Details & Text</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Tab Title <span className="text-gray-400 font-normal lowercase">(e.g. Up to 70% Off Deals)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter tab title"
                                    value={tabTitle}
                                    onChange={(e) => setTabTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Tab Subtitle <span className="text-gray-400 font-normal lowercase">(e.g. Shop Now)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter tab subtitle"
                                    value={tabSubtitle}
                                    onChange={(e) => setTabSubtitle(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="w-full sm:w-auto px-6 py-2 cursor-pointer text-sm font-semibold rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || (!selectedFile && !banner)}
                        className="w-full sm:w-auto px-6 py-2 cursor-pointer text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-green-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                    >
                        <span className={`flex items-center transition-opacity ${isSaving ? 'opacity-0' : 'opacity-100'}`}>
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
