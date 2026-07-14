import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import AddToCartButton from '@/components/AddToCartButton';

export const dynamic = 'force-dynamic';

async function getProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        return await res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export default async function Home() {
    const allProducts = await getProducts();
    const products = allProducts.filter((p: any) => p.isActive !== false);
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="w-full flex-1 mb-20">
                {/* Hero Banner Section */}
                <div className="max-w-[1400px] mx-auto px-0 sm:px-2 mt-0 sm:mt-2">
                    <HeroCarousel />
                </div>

                {/* Deals Section */}
                <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-4 sm:mt-8">
                    <div className="flex items-center gap-4 mb-2 sm:mb-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Recommended for you</h2>
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 pb-4">
                            {products.length > 0 ? products.map((product: any) => (
                                <Link href={`/products/${product._id}`} key={product._id} className="bg-white rounded-md flex flex-col cursor-pointer hover:shadow-lg transition-shadow group border border-gray-300 overflow-hidden w-full">
                                    <div className="w-full aspect-[6/5] flex items-center justify-center relative bg-white border-b border-gray-100 p-2.5 sm:p-4">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL}/upload/file/${product.images[0]}`} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        )}
                                        {/* Add to Cart button that appears on hover */}
                                        <AddToCartButton product={product} />
                                    </div>
                                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col relative">
                                        <div className="text-[13px] text-gray-800 line-clamp-3 leading-snug mb-2 flex-1 font-medium group-hover:text-blue-700 transition-colors">
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
                                                <span className="text-sm font-medium relative -top-0.5 pr-0.5">₹</span>{product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price}
                                            </div>
                                            {product.discount > 0 && (
                                                <>
                                                    <div className="text-xs text-gray-500 line-through">
                                                        ₹{product.price}
                                                    </div>
                                                    <div className="bg-[#ff3344] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                        {product.discount}% OFF
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-gray-500 py-8 text-sm">No recommended products available at the moment. Add some products in the admin panel.</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
