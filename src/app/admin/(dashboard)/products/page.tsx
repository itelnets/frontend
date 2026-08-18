'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProducts, deleteProduct, updateProduct, reorderProducts } from '@/services/product';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import { formatDate } from '@/utils/formatDate';
import CopyIcon from '@/components/CopyIcon';
import SortDropdown from '@/components/SortDropdown';

interface Product {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
    type?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [typeFilter, setTypeFilter] = useState('All Types');
    const itemsPerPage = 20;

    const dynamicTypeOptions = Array.from(new Set([
        'All Types',
        'Supplements', 'Sports', 'Bath', 'Beauty', 'Grocery', 'Home', 'Baby', 'Pets',
        ...products.map(p => p.type).filter((t): t is string => Boolean(t))
    ]));
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const [paginationPortalNode, setPaginationPortalNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalNode(document.getElementById('products-topbar-portal'));
        setPaginationPortalNode(document.getElementById('products-pagination-portal'));
    }, []);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [viewImagesProduct, setViewImagesProduct] = useState<Product | null>(null);
    const [draggableRowId, setDraggableRowId] = useState<string | null>(null);
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

        const draggedProduct = paginatedProducts[dragIndex.current];
        const hoveredProduct = paginatedProducts[hoverIndex.current];

        const realDragIndex = products.findIndex(p => p._id === draggedProduct._id);
        const realHoverIndex = products.findIndex(p => p._id === hoveredProduct._id);

        if (realDragIndex === -1 || realHoverIndex === -1) return;

        const updated = [...products];
        const [moved] = updated.splice(realDragIndex, 1);
        updated.splice(realHoverIndex, 0, moved);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.length >= 4 || searchInput.length === 0) {
                setSearchQuery(searchInput);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const paginatedProducts = products;

    const fetchProducts = async (
        page: number = currentPage,
        query: string = searchQuery,
        typeVal: string = typeFilter
    ) => {
        setIsLoading(true);
        try {
            const typeParam = typeVal === 'All Types' ? '' : typeVal;

            const { data } = await getProducts({
                search: query,
                page: page,
                limit: itemsPerPage,
                isActive: 'all',
                type: typeParam
            });

            if (data && Array.isArray(data.products)) {
                setProducts(data.products);
                setTotalPages(data.totalPages || 1);
            } else if (Array.isArray(data)) {
                setProducts(data);
                setTotalPages(Math.max(1, Math.ceil(data.length / itemsPerPage)));
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkAdmin = () => {
            const userInfo = localStorage.getItem('adminInfo');
            if (!userInfo || JSON.parse(userInfo).role !== 'admin') {
                router.push('/admin/login');
                return;
            }

            fetchProducts(currentPage, searchQuery, typeFilter);
        };

        checkAdmin();
    }, [router, currentPage, searchQuery, typeFilter]);

    const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
        try {
            setProducts(products.map(p => p._id === productId ? { ...p, isActive: !currentStatus } : p));
            await updateProduct(productId, { isActive: !currentStatus });
            toast.success(`Product is now ${!currentStatus ? 'Active' : 'Hidden'}`);
        } catch (error: any) {
            setProducts(products.map(p => p._id === productId ? { ...p, isActive: currentStatus } : p));
            const errorMessage = error?.response?.data?.message || 'Failed to update product status';
            toast.error(errorMessage);
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
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to delete product';
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
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




    return (
        <div className="sm:p-4 w-full h-full flex-1 min-h-0 flex flex-col mx-auto font-sans">
            {/* Mobile & Tablet Controls (Below Topbar for screens < 1024px) */}
            <div className="lg:hidden px-2 sm:px-0 pt-2 sm:pt-0 pb-2 bg-gray-50 flex items-center justify-between gap-2 shrink-0 border-b border-gray-200 shadow-2xs">
                <div className="relative flex items-center flex-1">
                    <div className="absolute left-2.5 text-gray-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by product id and title"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="border border-gray-300 rounded-md pl-8 pr-8 h-[34px] text-[13px] outline-none focus:border-green-500 w-full transition-all bg-white shadow-2xs"
                    />
                    {searchInput && (
                        <button onClick={() => setSearchInput('')} className="absolute right-2 cursor-pointer w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <SortDropdown
                        isAdmin={true}
                        options={dynamicTypeOptions}
                        value={typeFilter}
                        onChange={(val) => setTypeFilter(val)}
                        className="z-30 w-[110px] sm:w-[130px]"
                        buttonClassName="h-[34px] text-[11px] sm:text-xs bg-white border border-gray-300 rounded-md px-2"
                        menuClassName="w-full"
                        listClassName="max-h-[200px]"
                    />
                </div>
            </div>

            <div className="bg-transparent sm:bg-white sm:rounded-lg sm:shadow-sm sm:border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto overflow-x-auto px-2 py-2 sm:p-0 flex flex-col">
                    {paginatedProducts.length === 0 && !isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-500 sm:bg-white sm:rounded-none">No products found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 block sm:table">
                            <thead className="bg-green-600 hidden sm:table-header-group sticky top-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th scope="col" className="px-3 py-3.5 w-8 border-b border-green-700"></th>
                                    <th scope="col" className="px-6 py-3.5 text-left text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Product</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-24 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Type</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-10 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Price</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-10 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Discount</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-10 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">D.Price</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-24 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Created</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-24 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Updated</th>
                                    <th scope="col" className="px-6 py-3.5 text-center w-20 text-[12px] sm:text-[13px] font-bold text-white uppercase tracking-wide whitespace-nowrap border-b border-green-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent sm:bg-white divide-y-0 sm:divide-y divide-gray-200 block sm:table-row-group">
                                {paginatedProducts.map((product, idx) => (
                                    <tr key={product._id} draggable={draggableRowId === product._id} onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => onDragOver(e, idx)} onDrop={onDrop} className="hover:bg-gray-50 transition-colors grid grid-cols-3 sm:table-row mb-2 sm:mb-0 bg-white border border-gray-200 sm:border-0 sm:border-b sm:border-gray-200 rounded-lg sm:rounded-none shadow-sm sm:shadow-none">
                                        {/* Drag Handle - Desktop only */}
                                        <td
                                            className="hidden sm:table-cell pl-3 px-2 py-2 border-b border-gray-200 w-8 text-gray-300 hover:text-gray-500 cursor-move"
                                            onMouseEnter={() => setDraggableRowId(product._id)}
                                            onMouseLeave={() => setDraggableRowId(null)}
                                        >
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
                                                    <div className="text-[12px] sm:text-sm font-semibold text-gray-900 flex items-start" title={product.name}>
                                                        <span className="line-clamp-2">{product.name}</span>
                                                        <CopyIcon text={product.name} label="Product Name" />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 justify-between flex-wrap mt-0.5 sm:mt-0">
                                                        <div className="text-[10px] sm:text-xs text-gray-500 break-all sm:break-normal flex items-center" title={product._id}>
                                                            <span>{product._id}</span>
                                                            <CopyIcon text={product._id} label="Product ID" />
                                                        </div>
                                                        {product.discount > 0 && (
                                                            <span className="sm:hidden inline-flex items-center px-1 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 flex-shrink-0">{product.discount}% OFF</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Type */}
                                        <td className="p-0 sm:px-4 sm:py-2 hidden sm:table-cell sm:border-b sm:border-gray-200 sm:whitespace-nowrap sm:text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[14px] font-medium text-gray-800">
                                                {product.type || 'N/A'}
                                            </span>
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
                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    onClick={() => toggleProductStatus(product._id, product.isActive !== false)}
                                                    className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.isActive !== false ? 'bg-green-600' : 'bg-gray-300'}`}
                                                    title={product.isActive !== false ? 'Hide Product' : 'Show Product'}
                                                >
                                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${product.isActive !== false ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
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
                                            <div className="flex items-end justify-between gap-2 pt-1">
                                                <div className="flex items-end gap-3 flex-1 min-w-0">
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase">Price</div>
                                                        <div className="text-[11px] font-semibold text-gray-800">₹{product.price}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase">D.Price</div>
                                                        <div className="text-[11px] font-semibold text-gray-800">₹{product.discount > 0 ? (product.price - (product.price * product.discount / 100)).toFixed(0) : product.price}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-400 uppercase">Type</div>
                                                        <div className="text-[11px] font-semibold text-gray-800">{product.type || 'N/A'}</div>
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex items-center gap-2 sm:gap-1.5 flex-shrink-0">
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
                                            <div className="flex items-center gap-3 h-5">
                                                <div>
                                                    <span className="text-[9px] font-semibold text-gray-400 uppercase">Created: </span>
                                                    <span className="text-[11px] font-medium text-gray-700">{formatDate(product.createdAt)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-semibold text-gray-400 uppercase">Updated: </span>
                                                    <span className="text-[11px] font-medium text-gray-700">{formatDate(product.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!productToDelete}
                title="Delete product?"
                description="Are you sure you want to delete this product permanently?"
                onCancel={() => setProductToDelete(null)}
                onConfirm={confirmDelete}
                cancelText="Cancel"
                confirmText="Delete"
                isLoading={isDeleting}
            />

            {/* Image Viewer Modal */}
            {viewImagesProduct && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm transition-all duration-300" onClick={() => setViewImagesProduct(null)}>
                    <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full p-4 sm:p-6 flex flex-col gap-2 sm:gap-4 animate-in fade-in zoom-in duration-300 max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 gap-2">
                            <h3 className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-1">{viewImagesProduct.name}</h3>
                            <button
                                onClick={() => setViewImagesProduct(null)}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {viewImagesProduct.images && viewImagesProduct.images.length > 0 ? (
                            <div className="relative group flex items-center justify-center w-full my-auto">
                                {viewImagesProduct.images.length > 1 && (
                                    <button
                                        onClick={() => scrollByOneImage('left')}
                                        className="absolute left-[-10px] sm:left-[-14px] z-10 p-2 rounded-full bg-white hover:bg-gray-100 shadow-md text-gray-800 border border-gray-200 cursor-pointer transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                <div
                                    ref={imageScrollRef}
                                    className="flex overflow-x-auto gap-4 items-center justify-center min-h-[18rem] sm:min-h-[26rem] lg:min-h-[30rem] w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2"
                                >
                                    {viewImagesProduct.images.map((img, idx) => (
                                        <div key={idx} className="flex-shrink-0 h-64 w-64 sm:h-[400px] sm:w-[400px] lg:h-[480px] lg:w-[480px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
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
                                        className="absolute right-[-10px] sm:right-[-14px] z-10 p-2 rounded-full bg-white hover:bg-gray-100 shadow-md text-gray-800 border border-gray-200 cursor-pointer transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {portalNode && createPortal(
                <>
                    <div className="hidden lg:flex relative items-center w-[350px] xl:w-[450px] shrink min-w-[120px]">
                        <div className="absolute left-2.5 text-gray-800">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by product id and title"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="border border-gray-300 rounded-md pl-8 pr-8 h-[32px] sm:h-[36px] text-[11px] sm:text-sm outline-none focus:border-green-500 w-full min-w-0 transition-all"
                        />
                        {searchInput && (
                            <button onClick={() => setSearchInput('')} className="absolute right-1.5 cursor-pointer w-4 h-4 sm:w-5 sm:h-5 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition-colors">
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </div>
                    <div className="hidden lg:flex items-center gap-2 sm:gap-3 shrink-0">
                        <SortDropdown
                            isAdmin={true}
                            options={dynamicTypeOptions}
                            value={typeFilter}
                            onChange={(val) => setTypeFilter(val)}
                            className="z-30 w-[120px] sm:w-[140px]"
                            buttonClassName="h-[32px] sm:h-[36px] text-[11px] sm:text-sm bg-white border border-gray-300 rounded-md"
                            menuClassName="w-full"
                            listClassName="max-h-[200px]"
                        />
                    </div>
                </>,
                portalNode
            )}

            {paginationPortalNode && createPortal(
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white border border-gray-300 rounded-md px-1 shadow-xs h-[30px] sm:h-[36px] shrink-0">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-1.5 py-0.5 sm:p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40 cursor-pointer text-xs sm:text-sm"
                    >
                        &lt;
                    </button>
                    <span className="text-[11px] sm:text-sm font-bold text-gray-700 px-0.5 sm:px-1 whitespace-nowrap min-w-[28px] sm:min-w-[44px] text-center">{currentPage} / {Math.max(1, totalPages)}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-1.5 py-0.5 sm:p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40 cursor-pointer text-xs sm:text-sm"
                    >
                        &gt;
                    </button>
                </div>,
                paginationPortalNode
            )}
        </div>
    );
}
