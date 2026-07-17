'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/services/product';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import Spinner from '@/components/Spinner';

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
    const { myLists, moveToList, removeFromList } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
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

    const isInList = (productId: string) => myLists.some((p: any) => p._id === productId);

    const toggleList = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (isInList(product._id)) {
            removeFromList(product._id);
        } else {
            moveToList(product);
        }
    };

    if (isLoading) {
        return (
            <div className="absolute min-h-auto inset-0 flex items-center justify-center">
                <Spinner className="w-8 h-8 text-green-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-5 px-2.5 sm:px-4 lg:px-5">
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 sm:gap-3">
                        {products.map((product) => (
                            <div key={product._id} className="h-full">
                                <ProductCard product={product} showHeart={true} />
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
