'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/services/product';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Spinner from '@/components/Spinner';

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const generateObjectId = () => {
        const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
        const randomHex = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16));
        return timestamp + randomHex;
    };

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/login');
        }
    }, [router]);

    // Detailed state for form fields
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount: '',
        overview: '',
        suggestedUse: '',
        otherIngredients: '',
        warnings: '',
        disclaimer: '',
    });

    // State for Selected Images
    const [selectedImages, setSelectedImages] = useState<{ file: File, previewUrl: string }[]>([]);
    const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);

    // State for Specifications
    const [specifications, setSpecifications] = useState<{ key: string, value: string }[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value = e.target.value;
        if (e.target.name !== 'price' && e.target.name !== 'discount' && value.length > 0) {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Upload image under 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            e.target.value = '';
            return;
        }

        const newImages = validFiles.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setSelectedImages(prev => [...prev, ...newImages]);

        // Reset the file input
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setSelectedImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[indexToRemove].previewUrl); // Clean up memory
            return newImages.filter((_, idx) => idx !== indexToRemove);
        });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedImageIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            if (e.target instanceof HTMLElement) e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedImageIdx(null);
        if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedImageIdx === null || draggedImageIdx === index) return;

        setSelectedImages(prev => {
            const newArr = [...prev];
            const draggedItem = newArr.splice(draggedImageIdx, 1)[0];
            newArr.splice(index, 0, draggedItem);
            return newArr;
        });
        setDraggedImageIdx(index);
    };

    const handleAddSpecification = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
        if (value.length > 0) {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const handleRemoveSpecification = (index: number) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.description.trim() || !formData.price.toString().trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (selectedImages.length === 0) {
            toast.error('Please add at least one image.');
            return;
        }

        setIsLoading(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const newProductId = generateObjectId();

            // Upload all selected images concurrently
            const uploadPromises = selectedImages.map(async (item) => {
                const formData = new FormData();
                formData.append('productId', newProductId);
                formData.append('image', item.file);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => null);
                    throw new Error(errData?.message || `Failed to upload image: ${item.file.name}`);
                }
                const data = await res.json();
                return data.imageKey;
            });

            const uploadedImageKeys = await Promise.all(uploadPromises);

            const productData = {
                _id: newProductId,
                ...formData,
                price: Number(formData.price),
                discount: Number(formData.discount),
                images: uploadedImageKeys, // Send array of keys
                specifications: specifications.filter(s => s.key.trim() !== '' && s.value.trim() !== ''),
            };

            await createProduct(productData);
            toast.success('Product created successfully!');
            router.push('/admin'); // Redirect to admin dashboard
        } catch (err: any) {
            console.error('Submission error:', err);
            toast.error(err.message || err.response?.data?.message || 'Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans">
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center p-8 bg-white/90 rounded-2xl shadow-2xl border border-gray-100">
                        <Spinner className="w-12 h-12 text-green-600 mb-4 animate-spin" />
                        <p className="text-base font-bold text-gray-800 tracking-wide">Creating Product...</p>
                        <p className="text-xs text-gray-500 mt-2">Please wait while we set up your product</p>
                    </div>
                </div>
            )}
            <div className="w-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 sm:p-6 transition-all">
                <form onSubmit={handleSubmit} noValidate className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Column - Sticky Images */}
                    <div className="w-full lg:w-5/12 space-y-4 lg:sticky top-20 self-start">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images <span className="text-red-500">*</span></label>
                            <div className="flex flex-col mb-3">
                                <label className={`bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 border border-transparent rounded-md transition-colors cursor-pointer w-fit flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    Add Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isLoading}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 font-medium">Upload images to showcase your product (Max 5MB).</p>

                            {/* Image Previews */}
                            {selectedImages.length > 0 && (
                                <div className="p-4 bg-gray-50/50 rounded-md border border-gray-100">
                                    <div className="w-full text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide flex justify-between items-center">
                                        <span>New Uploads (Drag to reorder)</span>
                                        <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">{selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedImages.map((img, idx) => (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, idx)}
                                                onDragEnd={handleDragEnd}
                                                onDragOver={(e) => handleDragOver(e, idx)}
                                                className="relative w-24 h-24 flex-shrink-0 group rounded-md overflow-hidden border-2 border-green-500 cursor-grab active:cursor-grabbing transition-transform"
                                            >
                                                <img src={img.previewUrl} alt={`Selected ${idx}`} className="w-full h-full object-cover pointer-events-none" />

                                                <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[9px] text-center font-bold py-0.5 uppercase tracking-wider">
                                                    New
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 cursor-pointer shadow-md"
                                                    title="Remove Image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Form Details */}
                    <div className="w-full lg:w-7/12 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                            <input name="name" value={formData.name} required onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="e.g. Premium Widget" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description <span className="text-red-500">*</span></label>
                            <textarea name="description" value={formData.description} required rows={2} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="Catchy one-liner..." />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Overview (Detailed Description)</label>
                            <textarea name="overview" value={formData.overview} rows={6} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="Extensive product overview..." />
                        </div>



                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
                                <input name="price" value={formData.price} type="number" required onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                                <input name="discount" value={formData.discount} type="number" onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="10" />
                            </div>
                        </div>

                        <div className="bg-green-50/30 rounded-md border border-green-50/50">
                            <label className="block text-sm font-semibold text-gray-800">Specifications</label>
                            {specifications.map((spec, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-3 bg-white/60 p-2 rounded-md border border-gray-100">
                                    <input
                                        type="text"
                                        placeholder="e.g. Weight"
                                        value={spec.key}
                                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-green-600 outline-none transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder="e.g. 1 kg"
                                        value={spec.value}
                                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-green-600 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSpecification(index)}
                                        className="bg-red-50 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 transition-all font-medium border border-red-100 cursor-pointer flex items-center justify-center"
                                        title="Remove Specification"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddSpecification}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-1 mt-2 px-3 py-1.5 border border-transparent rounded-md transition-colors cursor-pointer w-fit"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Add Specification
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Suggested Use</label>
                            <textarea name="suggestedUse" value={formData.suggestedUse} rows={3} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Other Ingredients</label>
                            <textarea name="otherIngredients" value={formData.otherIngredients} rows={3} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Warnings</label>
                            <textarea name="warnings" value={formData.warnings} rows={3} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Disclaimer</label>
                            <textarea name="disclaimer" value={formData.disclaimer} rows={3} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none" />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-white text-gray-700 text-sm font-medium px-8 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 border border-transparent rounded-md transition-colors disabled:opacity-80 cursor-pointer flex justify-center items-center order-1 sm:order-2 min-w-[130px]"
                            >
                                <span className={`transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>Create Product</span>
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Spinner className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
