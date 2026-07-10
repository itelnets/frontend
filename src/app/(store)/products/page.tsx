'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/services/product';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    discount: number;
    images: string[];
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
                toast.error('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-5 px-3 sm:px-4 lg:px-5">
            <div className="max-w-[1500px] mx-auto flex gap-8">
                {/* Left Sidebar (Filters - Desktop Only) */}
                <div className="w-64 shrink-0 hidden lg:block bg-white p-5 rounded-xl border border-gray-200 h-fit sticky top-6 shadow-sm">
                    <h2 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">Filters</h2>

                    <div className="mb-6">
                        <h3 className="font-semibold text-sm text-gray-800 mb-3">Categories</h3>
                        <div className="space-y-2.5 text-sm text-gray-600">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="checkbox" className="rounded text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> All Products</label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="checkbox" className="rounded text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> Supplements</label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="checkbox" className="rounded text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> Beauty</label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="checkbox" className="rounded text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> Grocery</label>
                        </div>
                    </div>

                    <div className="mb-6 border-t border-gray-100 pt-4">
                        <h3 className="font-semibold text-sm text-gray-800 mb-3">Price Range</h3>
                        <div className="space-y-2.5 text-sm text-gray-600">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="radio" name="price" className="text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> Under ₹500</label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="radio" name="price" className="text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> ₹500 - ₹1,000</label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="radio" name="price" className="text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> Over ₹1,000</label>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="font-semibold text-sm text-gray-800 mb-3">Customer Review</h3>
                        <div className="space-y-2.5 text-sm text-gray-600">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="radio" name="rating" className="text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> 4 Stars & Up</label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-[#007185]"><input type="radio" name="rating" className="text-[#007185] focus:ring-[#007185] w-4 h-4 cursor-pointer" /> 3 Stars & Up</label>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
                        <div>
                            <h1 className="text-xl sm:text-2xl text-gray-900 font-bold">All Products</h1>
                            <p className="text-sm text-gray-500 mt-1">Showing 1-{products.length} of {products.length} results</p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-3 text-sm">
                            <label className="text-gray-600 hidden sm:block whitespace-nowrap">Sort by:</label>
                            <select className="w-full sm:w-auto border border-gray-300 rounded-lg py-2 px-3 text-gray-700 bg-gray-50 hover:bg-gray-100 outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185] cursor-pointer transition-colors shadow-sm">
                                <option>Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Avg. Customer Review</option>
                                <option>Newest Arrivals</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3">
                        {products.map((product) => (
                            <div
                                onClick={() => router.push(`/products/${product._id}`)}
                                key={product._id}
                                className="bg-white rounded-md flex flex-col cursor-pointer shadow-sm hover:shadow-lg transition-shadow group border border-gray-300 overflow-hidden"
                            >
                                <div className="w-full aspect-square flex items-center justify-center relative bg-gray-50 border-b border-gray-100">
                                    {product.images && product.images.length > 0 ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    )}

                                    {product.discount > 0 && (
                                        <div className="absolute top-2 left-2 bg-[#ff3344] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            {product.discount}% OFF
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 flex-1 flex flex-col">
                                    <div className="text-[13px] text-gray-800 line-clamp-3 leading-snug mb-2 flex-1 font-medium group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">0 reviews</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-auto">
                                        <div className="text-lg font-bold text-gray-900">
                                            <span className="text-sm font-medium relative -top-0.5 pr-0.5">₹</span>{product.price}
                                        </div>
                                        {product.discount > 0 && (
                                            <div className="text-xs text-gray-500 line-through">
                                                ₹{Math.round(product.price / (1 - product.discount / 100))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-xl border border-gray-200 mt-6 shadow-sm">
                            <p className="text-xl text-gray-500">No products found. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
