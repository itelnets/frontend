'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById } from '@/services/product';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    images: string[];
    keyBenefits: string[];
    ingredients: string;
    howToUse: string;
    netQuantity: string;
    refundPolicy: string;
    manufacturerInfo: string;
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            try {
                const { data } = await getProductById(params.id as string);
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                }
            } catch (error) {
                console.error('Failed to fetch product', error);
                toast.error('Failed to load product details');
                router.push('/products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params.id, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-xl text-gray-600">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link href="/products" className="text-green-700 hover:text-green-800 font-medium mb-8 inline-block">
                    &larr; Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left: Images */}
                    <div className="space-y-8">
                        {product.images && product.images.length > 0 ? (
                            product.images.map((img, idx) => (
                                <div key={idx} className="bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                    <img
                                        src={img}
                                        alt={`${product.name} - View ${idx + 1}`}
                                        className="w-full h-auto object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600?text=No+Image' }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm aspect-w-4 aspect-h-3">
                                <div className="flex items-center justify-center h-full text-gray-400">No Images Available</div>
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl text-gray-900 mb-2 font-bold">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-3xl font-bold text-green-700">₹{product.price}</span>
                                {product.discount > 0 && (
                                    <>
                                        <span className="text-xl text-gray-400 line-through">
                                            ₹{Math.round(product.price * (1 + product.discount / 100))}
                                        </span>
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                                            {product.discount}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        <div>
                            <button 
                                onClick={() => toast.success('Added to cart successfully!')}
                                className="w-full bg-green-800 text-white py-4 rounded-lg text-lg font-bold hover:bg-green-700 transition shadow-lg transform active:scale-95"
                            >
                                Add to Cart
                            </button>
                        </div>

                        <div className="border-t pt-8 space-y-6">
                            {product.keyBenefits.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Key Benefits</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                        {product.keyBenefits.map((benefit, idx) => (
                                            <li key={idx}>{benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {product.ingredients && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Ingredients</h3>
                                    <p className="text-gray-600">{product.ingredients}</p>
                                </div>
                            )}

                            {product.howToUse && (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">How to Use</h3>
                                    <p className="text-gray-600">{product.howToUse}</p>
                                </div>
                            )}

                            <div className="bg-gray-50 p-6 rounded-lg space-y-4 text-sm text-gray-500">
                                <p><span className="font-semibold">Net Quantity:</span> {product.netQuantity || 'N/A'}</p>
                                <p><span className="font-semibold">Manufacturer:</span> {product.manufacturerInfo || 'N/A'}</p>
                                <p><span className="font-semibold">Refund Policy:</span> {product.refundPolicy || 'Standard return policy applies.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
