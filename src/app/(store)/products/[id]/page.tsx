import type { Metadata } from 'next';
import ProductDetailsClient from '@/components/ProductDetailsClient';

const rawSiteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com';
const siteUrl = (rawSiteUrl.includes('localhost') || rawSiteUrl.includes('127.0.0.1') || /192\.168\.\d+\.\d+/.test(rawSiteUrl))
    ? 'https://prathamherbs.com'
    : rawSiteUrl.replace(/\/$/, '');
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function fetchProduct(id: string) {
    if (!id || !apiUrl) return null;
    try {
        const res = await fetch(`${apiUrl}/products/${id}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> | { id: string } }): Promise<Metadata> {
    const resolvedParams = await params;
    const product = await fetchProduct(resolvedParams.id);

    if (!product) {
        return {
            title: 'Product | Pratham Herbs',
            description: 'Shop authentic Ayurvedic and herbal wellness products at Pratham Herbs.',
        };
    }

    const cleanDescription = (product.description || product.overview || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160) || 'Shop authentic Ayurvedic formulations, herbal powders, and holistic wellness supplements at Pratham Herbs.';

    const imageUrl = product.images?.[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : `${apiUrl}/upload/file/${product.images[0]}`)
        : `${siteUrl}/brand-logo.png`;

    return {
        title: `${product.name} | Pratham Herbs`,
        description: cleanDescription,
        keywords: [
            product.name,
            product.brand || 'Pratham Herbs',
            product.type || 'Ayurvedic',
            'Ayurvedic Medicine',
            'Herbal Supplement',
            'Pratham Herbs',
        ],
        openGraph: {
            title: `${product.name} | Pratham Herbs`,
            description: cleanDescription,
            url: `${siteUrl}/products/${product._id}`,
            siteName: 'Pratham Herbs',
            images: [
                {
                    url: imageUrl,
                    alt: product.name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Pratham Herbs`,
            description: cleanDescription,
            images: [imageUrl],
        },
        alternates: {
            canonical: `${siteUrl}/products/${product._id}`,
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await params;
    const product = await fetchProduct(resolvedParams.id);

    const originalPrice = product?.price || 0;
    const discount = product?.discount || 0;
    const currentPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

    const images: string[] = (product?.images || [])
        .map((img: string) => (img.startsWith('http') ? img : `${apiUrl}/upload/file/${img}`))
        .filter(Boolean);

    const cleanDescription = (product?.description || product?.overview || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s+/g, ' ')
        .trim();

    const jsonLdProduct = product ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: images.length > 0 ? images : [`${siteUrl}/brand-logo.png`],
        description: cleanDescription || `Buy ${product.name} online from Pratham Herbs. 100% authentic Ayurvedic and herbal formulations with fast delivery.`,
        sku: product._id,
        mpn: product._id,
        brand: {
            '@type': 'Brand',
            name: product.brand || product.manufacturer || 'Pratham Herbs',
        },
        offers: {
            '@type': 'Offer',
            url: `${siteUrl}/products/${product._id}`,
            priceCurrency: 'INR',
            price: currentPrice,
            priceValidUntil: '2030-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.inStock?.toLowerCase() === 'yes' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Pratham Herbs',
            },
        },
        aggregateRating: product.numReviews > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 5,
            reviewCount: product.numReviews,
        } : undefined,
    } : null;

    return (
        <>
            {jsonLdProduct && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
                />
            )}
            <ProductDetailsClient initialProduct={product} productId={resolvedParams.id} />
        </>
    );
}
