"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ImageZoom from '@/components/ImageZoom';
import CustomerReviews from '@/components/CustomerReviews';
import { getProductById, getProducts } from '@/services/product';
import AddToListsModal from '@/components/AddToListsModal';

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, myLists, moveToList, removeFromList } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [showReviewsPopover, setShowReviewsPopover] = useState(false);

    // Add to Lists modal state
    const [showListsModal, setShowListsModal] = useState(false);

    // Derived: check if this product is already in myLists (persisted in localStorage)
    const addedToList = myLists.some((p: any) => p._id === product?._id);

    const fetchProduct = async () => {
        try {
            if (params.id) {
                const { data } = await getProductById(params.id as string);
                setProduct(data);
            }
        } catch (error) {
            console.error("Failed to fetch product data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProduct();
    }, [params.id]);

    const getImageUrl = (img: string | undefined, fallback: string = "https://via.placeholder.com/600x600?text=No+Image+Available") => {
        if (!img) return fallback;
        if (img.startsWith('http')) return img;
        return `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${img}`;
    };

    const displayProduct = {
        name: product?.name,
        brand: product?.brand,
        manufacturer: product?.manufacturer,
        rating: product?.rating || 0,
        numReviews: product?.numReviews || 0,
        price: product?.price,
        discount: product?.discount,
        inStock: product?.inStock,
        packageQuantity: product?.packageQuantity,
        bestSeller: product?.bestSeller,
        soldRecently: "0",
        images: product?.images?.length ? product.images.map((img: string) => getImageUrl(img)) : [
            "https://via.placeholder.com/600x600?text=No+Image+Available"
        ],
        overview: product?.overview || null,
        specifications: product?.specifications || [],
        suggestedUse: product?.suggestedUse || null,
        otherIngredients: product?.otherIngredients || null,
        warnings: product?.warnings || null,
        disclaimer: product?.disclaimer || null,
        _id: product?._id,
        weight: product?.weight,
        weightUnit: product?.weightUnit,
    };

    const originalPrice = displayProduct.price;
    const currentPrice = displayProduct.discount > 0 ? Math.round(originalPrice * (1 - displayProduct.discount / 100)) : originalPrice;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    const renderReviewsPopover = () => (
        <div className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-5 cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-extrabold text-gray-900">{displayProduct.rating || 0}</div>
                <div className="flex flex-col">
                    <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => {
                            const rating = displayProduct.rating || 0;
                            if (rating >= i + 1) {
                                return (
                                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                );
                            } else if (rating > i) {
                                return (
                                    <div key={i} className="relative w-4 h-4">
                                        <svg className="absolute top-0 left-0 w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <svg className="absolute top-0 left-0 w-4 h-4 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                );
                            } else {
                                return (
                                    <svg key={i} className="w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                );
                            }
                        })}
                    </div>
                    <span className="text-[10px] text-gray-500">Based on {displayProduct.numReviews} ratings</span>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                {[
                    { star: 5, pct: 87, w: 'w-[87%]', color: 'bg-green-700' },
                    { star: 4, pct: 10, w: 'w-[10%]', color: 'bg-green-600' },
                    { star: 3, pct: 2, w: 'w-[2%]', color: 'bg-green-400' },
                    { star: 2, pct: 0, w: 'w-[0%]', color: 'bg-gray-200' },
                    { star: 1, pct: 0, w: 'w-[0%]', color: 'bg-gray-200' },
                ].map((row) => (
                    <div key={row.star} className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex text-yellow-400 w-16">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < row.star ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${row.color} ${row.w}`}></div>
                        </div>
                        <div className="w-6 text-right text-[10px]">{row.pct}%</div>
                    </div>
                ))}
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    Review highlights
                    <svg className="w-3.5 h-3.5 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Heart health
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Feeling better
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Premium option
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-800 text-xs px-2.5 py-1.5 rounded-full border border-green-200 hover:bg-green-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Smooth and pliable
                    </span>
                    <span className="flex items-center gap-1.5 bg-red-50 text-red-800 text-xs px-2.5 py-1.5 rounded-full border border-red-200 hover:bg-red-100 cursor-pointer transition-colors">
                        <svg className="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        Fishy after taste
                    </span>
                </div>
            </div>

            <div className="text-center">
                <Link href="#" className="text-blue-600 hover:underline text-xs font-bold flex items-center justify-center gap-1">
                    See customer reviews
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>
        </div>
    );

    const renderTitleAndRating = () => (
        <div className="mb-2 lg:mb-6">
            <div className="flex items-center gap-2 mb-2">
                <span
                    className={`text-black text-[13px] font-bold px-2 py-1 rounded ${displayProduct.brand ? "bg-[#B7E6FF]" : ""
                        }`}
                >
                    {displayProduct.brand}
                </span>
                {displayProduct.bestSeller?.toLowerCase() === 'yes' && <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">Best seller</span>}
            </div>

            <h1 className="text-[14px] sm:text-xl font-bold text-gray-900 leading-snug">
                {displayProduct.name}
            </h1>

            <div className="text-[12px] sm:text-sm text-gray-600">
                By <Link href="#" className="text-[#0052A5]">{displayProduct.manufacturer}</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm lg:border-b lg:border-gray-100 lg:pb-4">

                {/* Rating with Popover */}
                <div
                    className="flex items-center gap-1 relative cursor-pointer"
                    onMouseEnter={() => setShowReviewsPopover(true)}
                    onMouseLeave={() => setShowReviewsPopover(false)}
                >
                    {/* Mobile View: 4.9 [1 star] 409 */}
                    <div className="flex lg:hidden items-center gap-1 cursor-pointer">
                        <span className="font-bold text-gray-700">{displayProduct.rating || 0}</span>
                        <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-[#0052A5]">{displayProduct.numReviews || 0}</span>
                    </div>

                    {/* Desktop View: 4.9 [5 stars] 409 */}
                    <div className="hidden lg:flex items-center gap-1 cursor-pointer">
                        <span className="font-bold text-gray-700">{displayProduct.rating || 0}</span>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => {
                                const rating = displayProduct.rating || 0;
                                if (rating >= i + 1) {
                                    return (
                                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    );
                                } else if (rating > i) {
                                    return (
                                        <div key={i} className="relative w-4 h-4">
                                            <svg className="absolute top-0 left-0 w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <svg className="absolute top-0 left-0 w-4 h-4 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <svg key={i} className="w-4 h-4 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    );
                                }
                            })}
                        </div>
                        <span className="text-[#0052A5]">{displayProduct.numReviews || 0}</span>
                    </div>

                    {showReviewsPopover && renderReviewsPopover()}
                </div>
            </div>
        </div>
    );

    const renderImageGallery = () => (
        <div className="w-full flex flex-col">
            <div className="mb-2 lg:mb-4">
                <ImageZoom src={displayProduct.images[selectedImageIdx]} alt={displayProduct.name} onHeartClick={() => setShowListsModal(true)} isHeartFilled={addedToList} />
            </div>
            <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
                {displayProduct.images.map((img: string, idx: number) => (
                    <div key={idx} onClick={() => setSelectedImageIdx(idx)} className={`aspect-square bg-white rounded-md border-2 p-1 cursor-pointer transition-colors ${idx === selectedImageIdx ? 'border-green-600' : 'border-transparent hover:border-gray-300'}`}>
                        <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCartBox = () => (
        <div className="w-full space-y-4">
            <div className="border border-gray-200 rounded-xl p-3 lg:p-5 bg-white">
                <div className="flex flex-row lg:items-baseline gap-1 lg:gap-2 mb-4 lg:mb-6">
                    <span className="text-xl lg:text-2xl font-extrabold text-gray-900">₹{(currentPrice * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {displayProduct.discount > 0 && (
                        <>
                            <span className="text-sm lg:text-base text-gray-500 line-through">₹{(originalPrice * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="bg-[#ff3344] text-white text-[10px] lg:text-xs font-bold px-1.5 py-1 rounded h-fit shadow-sm">{displayProduct.discount}% OFF</span>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between border border-gray-300 rounded-md p-1.5 lg:p-2 mb-3 lg:mb-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="font-bold text-gray-900 text-sm lg:text-base">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded">
                        <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <button onClick={() => addToCart(displayProduct, quantity)} className="w-full bg-[#f38700] hover:bg-[#e07b00] cursor-pointer text-white font-bold py-2.5 lg:py-3.5 rounded-md transition-colors shadow-sm mb-3 lg:mb-4 text-sm lg:text-base">
                    Add to Cart
                </button>

                <button
                    onClick={() => setShowListsModal(true)}
                    className={`w-full flex items-center justify-center gap-2 border ${addedToList ? 'border-green-600 bg-[#f0f7f4] text-green-700' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} font-bold py-2 lg:py-2.5 rounded-md transition-colors text-[13px] lg:text-sm cursor-pointer`}
                >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill={addedToList ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {addedToList ? 'Added to Lists' : 'Add to Lists'}
                </button>
            </div>

            <AddToListsModal
                product={displayProduct}
                isOpen={showListsModal}
                isAlreadyAdded={addedToList}
                onClose={() => setShowListsModal(false)}
                onAdded={() => { }}
                onRemoved={() => { }}
            />

            <div className="bg-[#f0f7f4] border border-[#e2efe9] rounded-xl p-3 lg:p-5">
                <div className="flex items-center gap-1.5 lg:gap-2 mb-1 lg:mb-2 font-bold text-green-800 text-xs lg:text-sm">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Quality Promise
                </div>
                <p className="text-[12px] lg:text-xs text-gray-700 mb-1 leading-tight">
                    This product is guaranteed authentic and backed by our easy returns & refunds policy.
                </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-3 lg:p-5 bg-white">
                {recommendedProducts.length > 0 ? (
                    <>
                        <div className="flex justify-center gap-2 mb-2">
                            <div className="w-12 h-16 border rounded p-1">
                                <img src={displayProduct.images[0]} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex items-center text-gray-400 text-xs">+</div>
                            <div className="w-12 h-16 border rounded p-1">
                                <img src={getImageUrl(recommendedProducts[0]?.images?.[0], 'https://via.placeholder.com/100x100?text=No+Image')} className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-800 font-bold mb-1">Combo with:</div>
                        <a href={`/products/${recommendedProducts[0]?._id}`} className="text-[10px] text-blue-600 hover:underline leading-tight block mb-2 line-clamp-2">{recommendedProducts[0]?.name}</a>
                        <p className="text-[9px] text-gray-500 mb-3 bg-gray-50 p-1.5 rounded line-clamp-2">{recommendedProducts[0]?.description || 'A great addition to your health routine.'}</p>

                        <div className="text-center font-bold text-sm text-gray-900 mb-2">Combo price: ₹{(currentPrice + (recommendedProducts[0]?.discount > 0 ? Math.round(recommendedProducts[0]?.price * (1 - recommendedProducts[0]?.discount / 100)) : recommendedProducts[0]?.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <button className="w-full bg-[#f38700] hover:bg-[#e07b00] text-white font-bold py-2 lg:py-2.5 rounded-md transition-colors text-sm">
                            Add Both to Cart
                        </button>
                    </>
                ) : (
                    <div className="text-center text-sm text-gray-500">No combo deals currently available.</div>
                )}
            </div>
        </div>
    );

    const renderProductDetailsBottom = () => (
        <div className="w-full flex flex-col pt-4 lg:pt-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs lg:text-sm font-bold text-green-700">In Stock: {displayProduct.inStock}</span>
                <span className="text-[10px] lg:text-xs font-medium text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    {displayProduct.soldRecently} sold in 30 days
                </span>
            </div>
            {displayProduct.packageQuantity && (
                <div className="text-xs lg:text-sm text-gray-700 mb-4 font-medium">
                    Package Quantity: {displayProduct.packageQuantity}
                </div>
            )}

            <div className="space-y-6 lg:space-y-8 mt-6 lg:mt-8 text-sm lg:text-base">
                <div>
                    <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Quality standards & manufacturing</h3>
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFrequentlyPurchased = () => {
        return (
            <div className="w-full pt-6 lg:pt-8">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 px-2 lg:px-0">Frequently purchased together</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 lg:px-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {recommendedProducts.length > 0 ? recommendedProducts.map((prod, i) => (
                        <div key={i} onClick={() => router.push(`/products/${prod._id}`)} className="min-w-[140px] max-w-[140px] lg:min-w-[160px] lg:max-w-[160px] flex flex-col cursor-pointer group">
                            <div className="aspect-square bg-white p-2 mb-2 lg:mb-3 flex items-center justify-center relative overflow-hidden transition-colors border border-gray-100 rounded">
                                <img src={getImageUrl(prod.images?.[0], 'https://via.placeholder.com/150x150?text=No+Image')} className="h-[80%] object-contain     rm duration-300 group-hover:scale-105" />
                            </div>
                            <div className="text-[10px] lg:text-[11px] text-gray-800 hover:underline mb-1 line-clamp-3 leading-snug">
                                {prod.name}
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, j) => (
                                        <svg key={j} className="w-2.5 h-2.5 lg:w-3 lg:h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <span className="text-[9px] lg:text-[10px] text-gray-500">10k+</span>
                            </div>
                            <div className="flex items-center gap-2 mt-auto">
                                <div className="font-bold text-gray-900 text-xs lg:text-sm">
                                    ₹{prod.discount > 0 ? Math.round(prod.price * (1 - prod.discount / 100)) : prod.price}
                                </div>
                                {prod.discount > 0 && (
                                    <>
                                        <div className="text-[10px] text-gray-500 line-through">
                                            ₹{prod.price}
                                        </div>
                                        <div className="bg-[#ff3344] text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">
                                            {prod.discount}% OFF
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="text-gray-500 text-sm">No recommendations available at this time.</div>
                    )}
                </div>
            </div>
        );
    };

    const renderProductInformation = () => (
        <div className="w-full mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 bg-gray-50 py-3 lg:py-4 px-0 sm:px-1 rounded-md">Product information</h2>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-0 sm:px-2 lg:px-4">
                {/* Left Col: Overview */}
                <div className="w-full">
                    {displayProduct.overview && (
                        <>
                            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Overview</h3>
                            <div className="text-xs lg:text-sm text-gray-700 leading-relaxed mb-4 lg:mb-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: displayProduct.overview }} />
                        </>
                    )}

                    {displayProduct.specifications?.length > 0 && (
                        <>
                            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Specifications</h3>
                            <ul className="list-disc pl-4 lg:pl-5 space-y-1.5 text-xs lg:text-sm text-gray-800 mb-4 lg:mb-6">
                                {displayProduct.specifications.map((spec: any, idx: number) => (
                                    <li key={idx}>{spec.key}: {spec.value}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {displayProduct.suggestedUse && (
                        <>
                            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Suggested use</h3>
                            <p className="text-xs lg:text-sm text-gray-800 leading-relaxed mb-4 lg:mb-6 whitespace-pre-wrap">
                                {displayProduct.suggestedUse}
                            </p>
                        </>
                    )}

                    {displayProduct.otherIngredients && (
                        <>
                            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Other ingredients</h3>
                            <div className="text-xs lg:text-sm text-gray-800 space-y-4 mb-4 lg:mb-6 whitespace-pre-wrap">
                                {displayProduct.otherIngredients}
                            </div>
                        </>
                    )}

                    {displayProduct.warnings && (
                        <>
                            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Warnings</h3>
                            <div className="text-xs lg:text-sm text-gray-800 space-y-4 mb-4 lg:mb-6 leading-relaxed whitespace-pre-wrap">
                                {displayProduct.warnings}
                            </div>
                        </>
                    )}

                    {displayProduct.disclaimer && (
                        <>
                            <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Disclaimer</h3>
                            <div className="text-xs lg:text-sm text-gray-800 space-y-4 mb-4 lg:mb-6 leading-relaxed whitespace-pre-wrap">
                                {displayProduct.disclaimer}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-gray-200">
                <div className="max-w-[1400px] mx-auto px-4 py-2 lg:py-3 text-[10px] lg:text-xs text-gray-500 flex flex-col gap-0.5 lg:gap-1">
                    <div className="flex flex-wrap items-center gap-1">
                        <Link href="#" className="hover:underline whitespace-nowrap">Brands A-Z</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline text-gray-800 whitespace-nowrap">{displayProduct.brand}</Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                        <Link href="#" className="hover:underline whitespace-nowrap">Categories</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline whitespace-nowrap">Supplements</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline whitespace-nowrap">Omegas & Fish Oils (EPA DHA)</Link>
                        <span>&gt;</span>
                        <Link href="#" className="hover:underline whitespace-nowrap">Omega-3 Fish Oil</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-3 sm:p-4">

                {/* --- MOBILE LAYOUT (hidden on desktop) --- */}
                <div className="flex flex-col lg:hidden gap-2 sm:gap-6">
                    {renderTitleAndRating()}
                    {renderImageGallery()}
                    {renderProductDetailsBottom()}
                    {renderCartBox()}
                </div>

                {/* --- DESKTOP LAYOUT (hidden on mobile) --- */}
                <div className="hidden lg:flex flex-row gap-10">
                    <div className="w-[35%] relative z-50">
                        <div className="sticky top-32 z-50">
                            {renderImageGallery()}
                        </div>
                    </div>
                    <div className="w-[40%] flex flex-col relative z-10">
                        {renderTitleAndRating()}
                        {renderProductDetailsBottom()}
                    </div>
                    <div className="w-[25%] relative z-10">
                        <div className="sticky top-28 z-10">
                            {renderCartBox()}
                        </div>
                    </div>
                </div>

                {/* NEW SECTIONS: Appended to both mobile & desktop layouts */}
                {renderFrequentlyPurchased()}
                {renderProductInformation()}
                <CustomerReviews productId={params.id as string} onReviewSubmitted={fetchProduct} />

            </div>
        </div>
    );
}
