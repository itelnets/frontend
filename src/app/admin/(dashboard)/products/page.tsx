'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct } from '@/services/product';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
}

export default function AdminProductsList() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simple auth check
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
            router.push('/admin/login');
            return;
        }

        fetchProducts();
    }, [router]);

    const fetchProducts = async () => {
        try {
            const { data } = await getProducts();
            setProducts(Array.isArray(data) ? [...data].reverse() : data);
        } catch (error) {
            console.error('Failed to fetch products', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully');
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            console.error('Failed to delete product', error);
            toast.error('Failed to delete product');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
                    <div className="flex gap-4">
                        <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-4 py-2">
                            Back to Admin
                        </Link>
                        <Link href="/admin/products/add" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition shadow">
                            + Add New Product
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {products.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No products found. Add some to get started!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 block sm:table">
                                <thead className="bg-gray-100 hidden sm:table-header-group">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-[18px] font-bold text-green-900">Product</th>
                                        <th scope="col" className="px-6 py-4 text-center w-24 text-[18px] font-bold text-green-900">Price</th>
                                        <th scope="col" className="px-6 py-4 text-center w-24 text-[18px] font-bold text-green-900">Discount</th>
                                        <th scope="col" className="px-6 py-4 text-center w-24 text-[18px] font-bold text-green-900">D.Price</th>
                                        <th scope="col" className="px-6 py-4 text-right w-32 text-[18px] font-bold text-green-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors grid grid-cols-3 sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none">
                                            <td className="col-span-3 px-3 py-2 sm:px-4 sm:py-2 block sm:table-cell border-b sm:border-b sm:border-gray-200 border-gray-100 sm:whitespace-nowrap">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={product.images && product.images.length > 0 ? `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}` : 'https://via.placeholder.com/40?text=No+Img'}
                                                            alt={product.name}
                                                            onError={(e) => { if (!e.currentTarget.src.includes('via.placeholder.com')) { e.currentTarget.src = 'https://via.placeholder.com/150'; } }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-xs">{product._id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-1.5 sm:px-4 sm:py-2 flex flex-col sm:flex-row justify-center sm:justify-start items-start sm:items-center sm:table-cell border-b sm:border-b sm:border-gray-200 border-r sm:border-r-0 border-gray-100 sm:whitespace-nowrap sm:text-center">
                                                <span className="sm:hidden text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Price</span>
                                                <div className="text-xs sm:text-sm font-medium text-gray-900">₹{product.price}</div>
                                            </td>
                                            <td className="px-2 py-1.5 sm:px-4 sm:py-2 flex flex-col sm:flex-row justify-center sm:justify-start items-start sm:items-center sm:table-cell border-b sm:border-b sm:border-gray-200 border-gray-100 sm:whitespace-nowrap sm:text-center">
                                                <span className="sm:hidden text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Discount</span>
                                                <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium ${product.discount > 0 ? 'bg-green-200 text-green-900' : 'bg-gray-100 text-gray-800'}`}>
                                                    {product.discount > 0 ? `${product.discount}% OFF` : 'No Discount'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-1.5 sm:px-4 sm:py-2 flex flex-col sm:flex-row justify-center sm:justify-start items-start sm:items-center sm:table-cell border-b sm:border-b sm:border-gray-200 border-gray-100 sm:whitespace-nowrap sm:text-center">
                                                <span className="sm:hidden text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">D.Price</span>
                                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                    ₹{product.discount > 0 ? (product.price - (product.price * product.discount / 100)).toFixed(2) : product.price}
                                                </div>
                                            </td>
                                            <td className="col-span-3 px-3 py-2 sm:px-4 sm:py-2 flex justify-between items-center sm:table-cell sm:text-right text-sm font-medium sm:whitespace-nowrap sm:border-b sm:border-gray-200">
                                                <span className="sm:hidden text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">Actions</span>
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-900 font-bold bg-blue-50 px-3 py-1 rounded-md">
                                                        Edit
                                                    </Link>
                                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded-md">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
