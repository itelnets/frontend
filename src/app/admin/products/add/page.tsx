'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/services/product';
import toast from 'react-hot-toast';

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Detailed state for form fields
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

    // State for Image URLs
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

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
        setIsLoading(true);

        try {
            // Check if images are added
            if (imageUrls.length === 0) {
                toast.error('Please add at least one image URL.');
                setIsLoading(false);
                return;
            }

            const productData = {
                ...formData,
                price: Number(formData.price),
                discount: Number(formData.discount),
                keyBenefits: formData.keyBenefits.split(',').map(s => s.trim()).filter(s => s),
                images: imageUrls, // Send array of URLs
            };

            await createProduct(productData);
            toast.success('Product created successfully!');
            router.push('/admin');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Single Column Layout */}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input name="name" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" required rows={4} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
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
                        <p className="text-xs text-gray-500 mb-2">Add direct image links.</p>

                        {/* Image Previews */}
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
                            <input name="price" type="number" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                            <input name="discount" type="number" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Benefits (Comma separated)</label>
                        <input name="keyBenefits" onChange={handleChange} placeholder="Benefit 1, Benefit 2" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                        <textarea name="ingredients" rows={3} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How to Use</label>
                        <textarea name="howToUse" rows={3} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Net Quantity</label>
                        <input name="netQuantity" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Refund Policy</label>
                        <textarea name="refundPolicy" rows={2} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Info</label>
                        <input name="manufacturerInfo" onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
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
                            disabled={isLoading}
                            className="bg-green-700 text-white px-8 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50 shadow-md"
                        >
                            {isLoading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
