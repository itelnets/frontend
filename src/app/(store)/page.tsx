import HeroCarousel from '@/components/HeroCarousel';
import FeatureBar from '@/components/FeatureBar';
import TriggerMaintenance from '@/components/TriggerMaintenance';
import HomeProductSection from '@/components/HomeProductSection';

export const dynamic = 'force-dynamic';

async function getProducts() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?page=1&limit=30`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        return await res.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return { error: 'maintenance' };
    }
}

export default async function Home() {
    const data = await getProducts();
    const isMaintenance = !data || data.error === 'maintenance';
    const products = isMaintenance ? [] : (Array.isArray(data) ? data : data.products || []).filter((p: any) => p.isActive !== false);
    const totalProducts = isMaintenance ? 0 : (data.totalProducts ?? products.length);

    const siteUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com').replace(/\/$/, '');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const jsonLdItemList = products.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Pratham Herbs - Product Collection',
        description: 'Browse all authentic Ayurvedic and herbal products from Pratham Herbs.',
        numberOfItems: products.length,
        itemListElement: products.map((p: any, index: number) => {
            const imageUrl = p.images?.[0]
                ? (p.images[0].startsWith('http') ? p.images[0] : `${apiUrl}/upload/file/${p.images[0]}`)
                : `${siteUrl}/logo.png`;
            const finalPrice = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;

            return {
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: p.name,
                    url: `${siteUrl}/products/${p._id}`,
                    image: imageUrl,
                    description: p.overview ? p.overview.replace(/<[^>]*>?/gm, '').substring(0, 160) : `Buy ${p.name} at Pratham Herbs`,
                    brand: {
                        '@type': 'Brand',
                        name: p.brand || 'Pratham Herbs'
                    },
                    offers: {
                        '@type': 'Offer',
                        priceCurrency: 'INR',
                        price: finalPrice,
                        availability: p.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        url: `${siteUrl}/products/${p._id}`
                    }
                }
            };
        })
    } : null;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {jsonLdItemList && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
                />
            )}
            {isMaintenance && <TriggerMaintenance />}
            <main className="w-full flex-1 mb-2 sm:mb-6">
                {/* Hero Banner Section (Full Width Edge to Edge) */}
                <div className="w-full mb-2 sm:mb-4">
                    <HeroCarousel />
                </div>

                {/* Feature Highlights Bar */}
                <FeatureBar />

                {/* Deals Section */}
                <div className="max-w-[1400px] mx-auto px-2.5 sm:px-4 mt-1 sm:mt-[-20px] md:mt-[-10px] lg:mt-6">
                    <div className="flex items-center gap-4 mb-2 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended for you</h2>
                    </div>

                    <HomeProductSection initialProducts={products} initialTotal={totalProducts} />
                </div>
            </main>
        </div>
    );
}
