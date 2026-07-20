'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct } from '@/services/product';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import PageLoader from '@/components/PageLoader';

type ImageItem =
    | { type: 'existing', id: string, url: string }
    | { type: 'new', id: string, file: File, previewUrl: string };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = () => {
        setIsCancelling(true);
        router.push('/admin');
    };

    // Detailed state for form fields
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: '',
        price: '',
        discount: '',
        overview: '',
        suggestedUse: '',
        otherIngredients: '',
        warnings: '',
        disclaimer: '',
        brand: '',
        manufacturer: '',
        inStock: '',
        packageQuantity: '',
        bestSeller: '',
    });

    // State for Unified Images
    const [images, setImages] = useState<ImageItem[]>([]);
    const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleFileDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleFileDragLeave = () => {
        setIsDraggingOver(false);
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);

        if (isLoading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const validFiles = [];
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Image size must be less than 5MB`);
                continue;
            }
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
            if (fileExtension !== 'jpg' && fileExtension !== 'jpeg') {
                toast.error(`Only JPG/JPEG files are allowed`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        const newImageItems: ImageItem[] = validFiles.map(file => ({
            type: 'new',
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImageItems]);
    };

    // State for Specifications
    const [specifications, setSpecifications] = useState<{ key: string, value: string }[]>([]);

    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchProduct();
    }, [productId, router]);

    const fetchProduct = async () => {
        try {
            const { data } = await getProductById(productId);
            setFormData({
                name: data.name || '',
                type: data.type || '',
                description: data.description || '',
                price: data.price?.toString() || '',
                discount: data.discount?.toString() || '0',
                overview: data.overview || '',
                suggestedUse: data.suggestedUse || '',
                otherIngredients: data.otherIngredients || '',
                warnings: data.warnings || '',
                disclaimer: data.disclaimer || '',
                brand: data.brand || '',
                manufacturer: data.manufacturer || '',
                inStock: data.inStock || '',
                packageQuantity: data.packageQuantity || '',
                bestSeller: data.bestSeller || '',
            });
            const existingMapped: ImageItem[] = (data.images || []).map((img: string) => ({
                type: 'existing',
                id: Math.random().toString(36).substring(7),
                url: img
            }));
            setImages(existingMapped);
            setSpecifications(data.specifications || []);
        } catch (error) {
            console.error('Failed to fetch product', error);
            toast.error('Failed to load product details');
            router.push('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let value = e.target.value;
        if (e.target.name !== 'price' && e.target.name !== 'discount' && value.length > 0) {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const validFiles = [];
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`Image size must be less than 5MB`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) {
            e.target.value = '';
            return;
        }

        const newImageItems: ImageItem[] = validFiles.map(file => ({
            type: 'new',
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setImages(prev => [...prev, ...newImageItems]);

        // Reset the file input
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prev => {
            const newImages = [...prev];
            const item = newImages[indexToRemove];
            if (item.type === 'new') {
                URL.revokeObjectURL(item.previewUrl);
            }
            return newImages.filter((_, idx) => idx !== indexToRemove);
        });
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedImageIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        // Minor visual feedback
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

        setImages(prev => {
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

        if (images.length === 0) {
            toast.error('Please have at least one image.');
            return;
        }

        setIsSaving(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            // Process all images in their current exact order
            const uploadPromises = images.map(async (item) => {
                if (item.type === 'existing') {
                    // For existing images, just return the existing URL/key
                    return item.url;
                }

                // For new images, upload them
                const formDataToUpload = new FormData();
                formDataToUpload.append('productId', productId);
                formDataToUpload.append('image', item.file);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formDataToUpload
                });

                if (!res.ok) throw new Error('Image upload failed');
                const data = await res.json();
                return data.imageUrl;
            });

            const finalImageUrls = await Promise.all(uploadPromises);

            const productData = {
                ...formData,
                price: Number(formData.price),
                discount: Number(formData.discount),
                images: finalImageUrls, // Send total combined array of full S3 URLs
                specifications: specifications.filter(s => s.key.trim() !== '' && s.value.trim() !== ''),
            };

            await updateProduct(productId, productData);
            toast.success('Product updated successfully!');
            router.push('/admin'); // Redirect to admin dashboard
        } catch (err: any) {
            console.error('Submission error:', err);
            toast.error(err.message || err.response?.data?.message || 'Failed to update product');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isCancelling || isSaving) {
        return <PageLoader />;
    }

    return (
        <div className="font-sans p-0 sm:p-4 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
            <div className="w-full lg:flex-1 bg-white/80 backdrop-blur-xl border border-white/50 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3 sm:p-6 transition-all lg:overflow-hidden lg:flex lg:flex-col">

                <form id="product-form" onSubmit={handleSubmit} noValidate className="flex flex-col lg:flex-row gap-8 items-start lg:flex-1 lg:overflow-hidden">

                    {/* Left Column - Images & Basic Info */}
                    <div className="w-full lg:w-5/12 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <label className="block text-sm font-semibold text-gray-700">Product Images</label>
                            </div>

                            {/* Drag and Drop Upload Container */}
                            <div
                                onDragOver={handleFileDragOver}
                                onDragLeave={handleFileDragLeave}
                                onDrop={handleFileDrop}
                                onClick={() => document.getElementById('product-image-input')?.click()}
                                className={`border-2 border-dashed rounded-lg py-2 px-3 flex items-center gap-3 cursor-pointer transition-all mb-4 ${isDraggingOver
                                    ? 'border-green-600 bg-green-50/30 scale-[0.99]'
                                    : 'border-gray-300 hover:border-green-500 bg-gray-50/50 hover:bg-gray-50'
                                    }`}
                            >
                                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div>
                                    <span className="text-xs font-semibold text-gray-600">
                                        Drag &amp; Drop or <span className="text-green-600 hover:underline">Browse</span>
                                    </span>
                                    <p className="text-[10px] text-gray-400">JPG, JPEG · Max 5MB · Up to 5 images</p>
                                </div>
                                <input
                                    id="product-image-input"
                                    type="file"
                                    accept="image/jpeg, .jpg, .jpeg"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isSaving}
                                />
                            </div>

                            {/* Unified Drag-and-Drop Image List */}
                            {images.length > 0 && (
                                <div className="p-3 sm:p-4 bg-gray-100 rounded-md border border-gray-100">
                                    <div className="w-full text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide flex justify-between items-center">
                                        <span>Drag to reorder</span>
                                        <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">{images.length} Image{images.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 sm:gap-4">
                                        {images.map((img, idx) => {
                                            const isNew = img.type === 'new';
                                            const getImageUrl = (urlOrKey: string) => urlOrKey.startsWith('http') ? urlOrKey : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${urlOrKey}`;
                                            const imgSrc = isNew ? img.previewUrl : getImageUrl(img.url);
                                            return (
                                                <div
                                                    key={img.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, idx)}
                                                    onDragEnd={handleDragEnd}
                                                    onDragOver={(e) => handleDragOver(e, idx)}
                                                    className={`relative w-24 h-24 flex-shrink-0 group rounded-md overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-transform ${isNew ? 'border-green-500' : 'border-green-700 shadow-sm'}`}
                                                >
                                                    <img src={imgSrc} alt={`Image ${idx}`} className="w-full h-full object-cover pointer-events-none" onError={(e) => { if (!e.currentTarget.src.includes('via.placeholder.com')) { e.currentTarget.src = 'https://via.placeholder.com/150'; } }} />

                                                    {/* Badge for New Images */}
                                                    {isNew && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[9px] text-center font-bold py-0.5 uppercase tracking-wider">
                                                            New
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-[3px] cursor-pointer shadow-md"
                                                        title="Remove Image"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Moved Fields */}
                        <div className="space-y-4 mt-6 pt-6 border-t-2 border-green-200">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="e.g. Premium Widget" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                                    <input name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="e.g. Itelents Brands" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                                    <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="e.g. Itelents Brands" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                    <input name="price" value={formData.price} type="number" onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                                    <input name="discount" value={formData.discount} type="number" onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">In Stock</label>
                                    <div className="flex items-center gap-6 px-1 py-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                            <input type="radio" name="inStock" value="Yes" checked={formData.inStock === 'Yes'} onChange={handleChange} className="accent-green-600 w-4 h-4 cursor-pointer" /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                                            <input type="radio" name="inStock" value="No" checked={formData.inStock === 'No'} onChange={handleChange} className="accent-green-600 w-4 h-4 cursor-pointer" /> No
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Package Quantity</label>
                                    <input name="packageQuantity" value={formData.packageQuantity} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="e.g. 240 Tablets" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Overview, Details, etc */}
                    <div className="w-full lg:w-7/12 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-10 scrollbar-thin scrollbar-thumb-gray-200">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Overview</label>
                            <textarea name="overview" value={formData.overview} rows={6} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200 rounded-md focus:outline-none focus:border-green-600 transition-all outline-none placeholder-gray-400" placeholder="Extensive product overview..." />
                        </div>

                        <div className="bg-green-50/30 rounded-md border border-green-50/50">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                            {specifications.map((spec, index) => (
                                <div key={index} className="relative flex flex-col sm:flex-row gap-1 sm:gap-3 bg-white/60 p-2 pr-11 sm:pr-2 rounded-md border border-gray-100">
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
                                    {/* Delete button: top-right corner on mobile, inline on sm+ */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSpecification(index)}
                                        className="absolute top-2 right-2 sm:static sm:flex bg-red-50 text-red-600 p-1.5 sm:px-3 sm:py-2 rounded-md hover:bg-red-100 transition-all border border-red-100 cursor-pointer flex items-center justify-center"
                                        title="Remove Specification"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddSpecification}
                                className="w-full bg-green-50 hover:bg-green-100 text-green-700 text-xl font-medium flex items-center justify-center py-1.5 mt-2 rounded-md transition-colors cursor-pointer border border-green-200"
                                title="Add Specification"
                            >
                                +
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
                        <div className="flex items-center justify-between px-3 py-2.5 bg-white/50 border border-gray-200 rounded-md transition-all hover:border-green-600/30">
                            <label className="text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, bestSeller: prev.bestSeller.toLowerCase() === 'yes' ? '' : 'Yes' }))}>
                                Best Seller
                            </label>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={formData.bestSeller.toLowerCase() === 'yes'}
                                onClick={() => setFormData(prev => ({ ...prev, bestSeller: prev.bestSeller.toLowerCase() === 'yes' ? '' : 'Yes' }))}
                                className={`${formData.bestSeller.toLowerCase() === 'yes' ? 'bg-green-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`${formData.bestSeller.toLowerCase() === 'yes' ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isCancelling || isSaving}
                                className="bg-white text-gray-700 text-sm font-medium px-8 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer order-2 sm:order-1 disabled:opacity-50 flex items-center justify-center"
                            >
                                {isCancelling ? (
                                    <>
                                        <Spinner className="w-4 h-4 mr-2 border-gray-600" />
                                    </>
                                ) : 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="relative bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-1.5 border border-transparent rounded-md transition-colors disabled:opacity-80 cursor-pointer flex justify-center items-center order-1 sm:order-2 min-w-[130px]"
                            >
                                <span className={`transition-opacity ${isSaving ? 'opacity-0' : 'opacity-100'}`}>Save Changes</span>
                                {isSaving && (
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
