'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct, updateProduct, reorderProducts } from '@/services/product';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import PageLoader from '@/components/PageLoader';
import { formatDate } from '@/utils/formatDate';

interface Product {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [viewImagesProduct, setViewImagesProduct] = useState<Product | null>(null);
    const imageScrollRef = useRef<HTMLDivElement>(null);
    const dragIndex = useRef<number | null>(null);
    const hoverIndex = useRef<number | null>(null);

    const onDragStart = (e: React.DragEvent, index: number) => {
        dragIndex.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        hoverIndex.current = index;
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (dragIndex.current === null || hoverIndex.current === null || dragIndex.current === hoverIndex.current) return;
        const updated = [...products];
        const [moved] = updated.splice(dragIndex.current, 1);
        updated.splice(hoverIndex.current, 0, moved);
        setProducts(updated);
        dragIndex.current = null;
        hoverIndex.current = null;
        // Persist order to backend
        try {
            await reorderProducts(updated.map(p => p._id));
        } catch (error) {
            console.error('Failed to save product order', error);
            toast.error('Failed to save order');
        }
    };

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
            setProducts(Array.isArray(data) ? data : data);
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
    const scrollByOneImage = (direction: 'left' | 'right') => {
        if (imageScrollRef.current) {
            const firstChild = imageScrollRef.current.firstElementChild as HTMLElement;
            if (firstChild) {
                // Get the width of the first image + gap
                const scrollAmount = firstChild.offsetWidth + 16;
                imageScrollRef.current.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    };


    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="p-2 sm:p-4 w-full mx-auto font-sans">

            <div className="bg-transparent sm:bg-white sm:border-1 sm:border-gray-300 sm:rounded-md overflow-hidden">
                <div className="overflow-hidden sm:overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
                    <table className="min-w-full divide-y divide-gray-200 block sm:table">
                        <thead className="bg-gray-100 hidden sm:table-header-group">
                            <tr>
                                <th scope="col" className="px-3 py-4 w-8"></th>
                                <th scope="col" className="px-6 py-4 text-left text-[16px] font-bold text-green-900">Product</th>
                                <th scope="col" className="px-6 py-4 text-center w-10 text-[16px] font-bold text-green-900">Price</th>
                                <th scope="col" className="px-6 py-4 text-center w-10 text-[16px] font-bold text-green-900">Discount</th>
                                <th scope="col" className="px-6 py-4 text-center w-10 text-[16px] font-bold text-green-900">D.Price</th>
                                <th scope="col" className="px-6 py-4 text-center w-24 text-[16px] font-bold text-green-900">Created</th>
                                <th scope="col" className="px-6 py-4 text-center w-24 text-[16px] font-bold text-green-900">Updated</th>
                                <th scope="col" className="px-6 py-4 text-center w-20 text-[16px] font-bold text-green-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group">
                            {products.length === 0 ? (
                                <tr className="block sm:table-row bg-white rounded-lg shadow-sm sm:shadow-none sm:rounded-none">
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 block sm:table-cell">
                                        No products found. Start by adding one!
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, idx) => (
                                    <tr key={product._id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} onDrop={onDrop} className="hover:bg-gray-50 transition-colors grid grid-cols-3 sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none cursor-grab active:cursor-grabbing">
                                        {/* Drag Handle - Desktop only */}
                                        <td className="hidden sm:table-cell pl-3 px-2 py-2 border-b border-gray-200 w-8 text-gray-300 hover:text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8-12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                            </svg>
                                        </td>
                                        <td className="col-span-3 w-full px-2 py-2 sm:py-2 block sm:table-cell border-b sm:border-b sm:border-gray-200 border-gray-100 sm:max-w-[250px] lg:max-w-[300px]">
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full">
                                                <div
                                                    className="h-14 w-14 sm:h-12 sm:w-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => setViewImagesProduct(product)}
                                                    title="View all images"
                                                >
                                                    {product.images && product.images.length > 0 ? (
                                                        <img className="h-full w-full object-cover" src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} onError={(e) => { if (!e.currentTarget.src.includes('via.placeholder.com')) { e.currentTarget.src = 'https://via.placeholder.com/150'; } }} />
                                                    ) : (
                                                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden flex-1 min-w-0">
                                                    <div className="text-[12px] sm:text-sm font-semibold text-gray-900 line-clamp-2" title={product.name}>{product.name}</div>
                                                    <div className="flex items-center gap-1.5 justify-between flex-wrap mt-0.5 sm:mt-0">
                                                        <div className="text-[10px] sm:text-xs text-gray-500 break-all sm:break-normal" title={product._id}>{product._id}</div>
                                                        {product.discount > 0 && (
                                                            <span className="sm:hidden inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 flex-shrink-0">{product.discount}% OFF</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Price */}
                                        <td className="p-0 sm:px-4 sm:py-2 hidden sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-center">
                                            <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                                        </td>
                                        {/* Discount */}
                                        <td className="p-0 sm:px-4 sm:py-2 hidden sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-center">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${product.discount > 0 ? 'bg-green-200 text-green-900' : 'bg-gray-100 text-gray-800'}`}>
                                                {product.discount > 0 ? `${product.discount}% OFF` : 'No Discount'}
                                            </span>
                                        </td>
                                        {/* D.Price */}
                                        <td className="p-0 sm:px-4 sm:py-2 hidden sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-center">
                                            <div className="text-sm font-medium text-gray-900">
                                                ₹{product.discount > 0 ? (product.price - (product.price * product.discount / 100)).toFixed(2) : product.price}
                                            </div>
                                        </td>
                                        {/* Created At */}
                                        <td className="p-0 sm:px-4 sm:py-2 hidden sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-center">
                                            <div className="text-sm font-medium text-gray-900">{formatDate(product.createdAt)}</div>
                                        </td>
                                        {/* Updated At */}
                                        <td className="p-0 sm:px-4 sm:py-2 hidden sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-center">
                                            <div className="text-sm font-medium text-gray-900">{formatDate(product.updatedAt)}</div>
                                        </td>
                                        {/* Actions */}
                                        <td className="p-0 sm:px-4 sm:py-2 sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-right hidden">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => toggleProductStatus(product._id, product.isActive !== false)}
                                                    className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${product.isActive !== false ? 'bg-green-600' : 'bg-gray-300'}`}
                                                    title={product.isActive !== false ? 'Hide Product' : 'Show Product'}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.isActive !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                <Link href={`/admin/products/edit/${product._id}`} title="Edit" className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none transition-colors shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button onClick={() => setProductToDelete(product._id)} title="Delete" className="inline-flex items-center justify-center p-1.5 border border-transparent rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none transition-colors cursor-pointer shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>

                                        {/* Mobile-only compact info row (col-span-3) */}
                                        <td className="col-span-3 sm:hidden px-3 pb-2 pt-0 block">
                                            {/* Row 1: Price + Discount + D.Price + Actions */}
                                            <div className="flex items-end justify-between gap-2">
                                                <div className="flex items-end gap-3 flex-1 min-w-0">
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase">Price</div>
                                                        <div className="text-[11px] font-semibold text-gray-800">₹{product.price}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase">D.Price</div>
                                                        <div className="text-[11px] font-semibold text-gray-800">₹{product.discount > 0 ? (product.price - (product.price * product.discount / 100)).toFixed(0) : product.price}</div>
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button
                                                        onClick={() => toggleProductStatus(product._id, product.isActive !== false)}
                                                        className={`cursor-pointer relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${product.isActive !== false ? 'bg-green-600' : 'bg-gray-300'}`}
                                                        title={product.isActive !== false ? 'Hide Product' : 'Show Product'}
                                                    >
                                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${product.isActive !== false ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                                    </button>
                                                    <Link href={`/admin/products/edit/${product._id}`} title="Edit" className="inline-flex items-center justify-center p-1 rounded text-green-700 bg-green-50 hover:bg-green-100 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button onClick={() => setProductToDelete(product._id)} title="Delete" className="inline-flex items-center justify-center p-1 rounded text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Row 2: Created At + Updated At */}
                                            <div className="flex items-center gap-3 mt-1">
                                                <div>
                                                    <span className="text-[9px] font-semibold text-gray-400 uppercase">Created: </span>
                                                    <span className="text-[10px] font-medium text-gray-700">{formatDate(product.createdAt)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-semibold text-gray-400 uppercase">Updated: </span>
                                                    <span className="text-[10px] font-medium text-gray-700">{formatDate(product.updatedAt)}</span>
                                                </div>
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

            {/* Image Viewer Modal */}
            {viewImagesProduct && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-all duration-300" onClick={() => setViewImagesProduct(null)}>
                    <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-3 sm:p-6 flex flex-col gap-1 sm:gap-4 animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3 gap-2">
                            <h3 className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-2">{viewImagesProduct.name}</h3>
                            <button onClick={() => setViewImagesProduct(null)} className="flex-shrink-0 text-white bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-colors cursor-pointer mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {viewImagesProduct.images && viewImagesProduct.images.length > 0 ? (
                            <div className="relative group flex items-center justify-center w-full">
                                {viewImagesProduct.images.length > 1 && (
                                    <button
                                        onClick={() => scrollByOneImage('left')}
                                        className="absolute left-[2px] sm:left-[-14px] z-10 p-1.5 sm:p-2 rounded-full bg-white hover:bg-gray-100 shadow-md text-gray-800 border border-gray-200 cursor-pointer transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                <div
                                    ref={imageScrollRef}
                                    className="flex overflow-x-auto gap-4 items-center min-h-[11rem] sm:min-h-[12rem] w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {viewImagesProduct.images.map((img, idx) => (
                                        <div key={idx} className="flex-shrink-0 h-40 w-40 sm:h-64 sm:w-64 bg-gray-50 rounded-md overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                                            <img
                                                className="h-full w-full object-contain p-2"
                                                src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${img}`}
                                                alt={`${viewImagesProduct.name} - Image ${idx + 1}`}
                                                onError={(e) => { if (!e.currentTarget.src.includes('via.placeholder.com')) { e.currentTarget.src = 'https://via.placeholder.com/150'; } }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {viewImagesProduct.images.length > 1 && (
                                    <button
                                        onClick={() => scrollByOneImage('right')}
                                        className="absolute right-[2px] sm:right-[-14px] z-10 p-1.5 sm:p-2 rounded-full bg-white hover:bg-gray-100 shadow-md text-gray-800 border border-gray-200 cursor-pointer transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">No images available for this product.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
