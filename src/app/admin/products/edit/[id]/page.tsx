'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct } from '@/services/product';
import toast from 'react-hot-toast';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount: '',
        keyBenefits: '',
        ingredients: '',
        howToUse: '',
        netQuantity: '',
        refundPolicy: '',
        manufacturerInfo: '',
    });

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    useEffect(() => {
        // Simple auth check
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchProduct();
    }, [productId, router]);

    const fetchProduct = async () => {
        try {
            const { data } = await getProductById(productId);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: data.price?.toString() || '',
                discount: data.discount?.toString() || '0',
                keyBenefits: data.keyBenefits ? data.keyBenefits.join(', ') : '',
                ingredients: data.ingredients || '',
                howToUse: data.howToUse || '',
                netQuantity: data.netQuantity || '',
                refundPolicy: data.refundPolicy || '',
                manufacturerInfo: data.manufacturerInfo || '',
            });
            setImageUrls(data.images || []);
        } catch (error) {
            console.error('Failed to fetch product', error);
            toast.error('Failed to load product details');
            router.push('/admin/products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddImageUrl = () => {
        if (currentImageUrl.trim()) {
            setImageUrls([...imageUrls, currentImageUrl.trim()]);
            setCurrentImageUrl('');
            toast.success('Image URL added!');
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (imageUrls.length === 0) {
                toast.error('Please add at least one image URL.');
                setIsSaving(false);
                return;
            }

            const productData = {
                ...formData,
                price: Number(formData.price),
                discount: Number(formData.discount),
                keyBenefits: formData.keyBenefits.split(',').map(s => s.trim()).filter(s => s),
                images: imageUrls,
            };

            await updateProduct(productId, productData);
            toast.success('Product updated successfully!');
            router.push('/admin/products');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update product');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Edit Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input name="name" value={formData.name} required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} required rows={4} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (URLs)</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={currentImageUrl}
                                onChange={(e) => setCurrentImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                            >
                                Add
                            </button>
                        </div>

                        {imageUrls.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {imageUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-w-1 aspect-h-1 group">
                                        <img src={url} alt={`Uploaded ${idx}`} className="w-full h-24 object-cover rounded-md border" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                            title="Remove Image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input name="price" value={formData.price} type="number" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                            <input name="discount" value={formData.discount} type="number" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Benefits (Comma separated)</label>
                        <input name="keyBenefits" value={formData.keyBenefits} onChange={handleChange} placeholder="Benefit 1, Benefit 2" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                        <textarea name="ingredients" value={formData.ingredients} rows={3} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How to Use</label>
                        <textarea name="howToUse" value={formData.howToUse} rows={3} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Net Quantity</label>
                        <input name="netQuantity" value={formData.netQuantity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Refund Policy</label>
                        <textarea name="refundPolicy" value={formData.refundPolicy} rows={2} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Info</label>
                        <input name="manufacturerInfo" value={formData.manufacturerInfo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-green-700 text-white px-8 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 shadow-md"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
