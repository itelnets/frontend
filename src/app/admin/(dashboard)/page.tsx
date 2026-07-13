'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct, updateProduct } from '@/services/product';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import PageLoader from '@/components/PageLoader';

interface Product {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
    isActive?: boolean;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        const checkAdmin = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
                router.push('/login');
                return;
            }

            fetchProducts();
        };

        checkAdmin();
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

    const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
        try {
            setProducts(products.map(p => p._id === productId ? { ...p, isActive: !currentStatus } : p));
            await updateProduct(productId, { isActive: !currentStatus });
            toast.success(`Product is now ${!currentStatus ? 'Active' : 'Hidden'}`);
        } catch (error) {
            setProducts(products.map(p => p._id === productId ? { ...p, isActive: currentStatus } : p));
            console.error('Failed to update product status', error);
            toast.error('Failed to update product status');
        }
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = async () => {
        if (!productToDelete || isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteProduct(productToDelete);
            toast.success('Product deleted successfully');
            setProducts(products.filter(p => p._id !== productToDelete));
            setProductToDelete(null);
        } catch (error) {
            console.error('Failed to delete product', error);
            toast.error('Failed to delete product');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="p-3 sm:p-5 w-full mx-auto font-sans">

            <div className="bg-transparent sm:bg-white sm:border-1 sm:border-gray-300 sm:rounded-md overflow-hidden">
                <div className="overflow-hidden sm:overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 block sm:table">
                        <thead className="bg-gray-100 hidden sm:table-header-group">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-[18px] font-bold text-green-900">Product</th>
                                <th scope="col" className="px-6 py-4 text-center w-10 text-[18px] font-bold text-green-900">Price</th>
                                <th scope="col" className="px-6 py-4 text-center w-10 text-[18px] font-bold text-green-900">Discount</th>
                                <th scope="col" className="px-6 py-4 text-center w-10 text-[18px] font-bold text-green-900">D.Price</th>
                                <th scope="col" className="px-6 py-4 text-center w-20 text-[18px] font-bold text-green-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group">
                            {products.length === 0 ? (
                                <tr className="block sm:table-row bg-white rounded-lg shadow-sm sm:shadow-none sm:rounded-none">
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 block sm:table-cell">
                                        No products found. Start by adding one!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors grid grid-cols-3 sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none">
                                        <td className="col-span-3 px-3 py-2 sm:px-4 sm:py-2 block sm:table-cell border-b sm:border-b sm:border-gray-200 border-gray-100 sm:whitespace-nowrap">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img className="h-full w-full object-cover" src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} onError={(e) => { if (!e.currentTarget.src.includes('via.placeholder.com')) { e.currentTarget.src = 'https://via.placeholder.com/150'; } }} />
                                                    ) : (
                                                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    )}
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
                                                <button
                                                    onClick={() => toggleProductStatus(product._id, product.isActive !== false)}
                                                    className={`cursor-pointer relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${product.isActive !== false ? 'bg-green-600' : 'bg-gray-300'}`}
                                                    title={product.isActive !== false ? 'Hide Product' : 'Show Product'}
                                                >
                                                    <span className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${product.isActive !== false ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'}`} />
                                                </button>
                                                <Link href={`/admin/products/edit/${product._id}`} className="inline-flex items-center justify-center px-2.5 py-1 sm:px-4 sm:py-1.5 border border-transparent text-[10px] sm:text-[14px] font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors shadow-sm">
                                                    Edit
                                                </Link>
                                                <button onClick={() => setProductToDelete(product._id)} className="inline-flex items-center justify-center px-2.5 py-1 sm:px-4 sm:py-1.5 border border-transparent text-[10px] sm:text-[14px] font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none transition-colors cursor-pointer shadow-sm">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-md shadow-[0_20px_50px_rgb(0,0,0,0.15)] max-w-sm sm:max-w-sm w-[95%] sm:w-full p-4 sm:p-5 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 mx-auto bg-red-100 rounded-full mb-3 sm:mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-2 sm:mb-3 tracking-tight">Delete Product?</h3>
                        <p className="text-sm sm:text-[14px] text-center text-gray-500 mb-4 sm:mb-6 font-normal">
                            Are you absolutely sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="w-24 sm:w-28 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all focus:outline-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="relative w-24 sm:w-28 px-4 py-1.5 text-sm font-medium rounded-md bg-gradient-to-r from-red-500 to-red-500 text-white hover:from-red-600 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 focus:outline-none focus:ring-red-200 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                <span className={`transition-opacity ${isDeleting ? 'opacity-0' : 'opacity-100'}`}>Delete</span>
                                {isDeleting && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Spinner className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
