import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>
};

const getSiteUrl = () => (process.env.NEXT_PUBLIC_FRONTEND_URL || '').replace(/\/$/, '');
const getApiUrl = () => (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const apiUrl = getApiUrl();
        const siteUrl = getSiteUrl();
        const productUrl = `${siteUrl}/products/${id}`;

        // Fetch product from backend
        const res = await fetch(`${apiUrl}/products/${id}`, { next: { revalidate: 3600 } });
        if (!res.ok) {
            return {
                title: 'Product Details',
            };
        }

        let product;
        try {
            product = await res.json();
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            return { title: 'Product Details' };
        }

        if (!product || !product.name) {
            return { title: 'Product Details' };
        }

        // Exact title from admin side
        const productTitle = product.name.trim();

        // Build list of all crawlable public images
        const allImages: string[] = (product.images && product.images.length > 0)
            ? product.images.map((img: string) => img.startsWith('http') ? img : `${apiUrl}/upload/file/${img}`)
            : [`${siteUrl}/brand-logo.png`];

        const primaryImage = allImages[0];

        const plainTextDescription = product.overview
            ? product.overview.replace(/<[^>]*>?/gm, '').substring(0, 160).trim()
            : (product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 160).trim() : `Buy ${productTitle} online at Pratham Herbs. 100% authentic Ayurvedic & herbal formulation.`);

        return {
            title: productTitle,
            description: plainTextDescription,
            keywords: [
                productTitle,
                product.brand || 'Pratham Herbs',
                product.type || 'Ayurvedic',
                'Buy ' + productTitle,
                'Ayurvedic Product',
                'Herbal Health',
                'Pratham Herbs',
            ],
            alternates: {
                canonical: productUrl,
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                    'max-video-preview': -1,
                },
            },
            openGraph: {
                type: 'website',
                url: productUrl,
                title: `${productTitle} | Pratham Herbs`,
                description: plainTextDescription,
                siteName: 'Pratham Herbs',
                images: allImages.map((imgUrl) => ({
                    url: imgUrl,
                    alt: productTitle,
                })),
            },
            twitter: {
                card: 'summary_large_image',
                title: `${productTitle} | Pratham Herbs`,
                description: plainTextDescription,
                images: [primaryImage],
            },
        };
    } catch (error) {
        return {
            title: 'Product Details',
        };
    }
}

export default async function ProductLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    let productSchema = null;
    let breadcrumbSchema = null;
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const apiUrl = getApiUrl();
        const siteUrl = getSiteUrl();
        const productUrl = `${siteUrl}/products/${id}`;

        const res = await fetch(`${apiUrl}/products/${id}`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const product = await res.json();
            if (product && product.name) {
                const productTitle = product.name.trim();
                const allImages: string[] = (product.images && product.images.length > 0)
                    ? product.images.map((img: string) => img.startsWith('http') ? img : `${apiUrl}/upload/file/${img}`)
                    : [`${siteUrl}/brand-logo.png`];

                const finalPrice = product.discount > 0
                    ? Math.round(product.price * (1 - product.discount / 100))
                    : (product.price || 0);

                const plainTextDescription = product.overview
                    ? product.overview.replace(/<[^>]*>?/gm, '').substring(0, 300).trim()
                    : (product.description ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 300).trim() : `Buy ${productTitle} at Pratham Herbs.`);

                const inStockStatus = (product.inStock !== 'no' && product.inStock !== 'false')
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock';

                productSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: productTitle,
                    image: allImages,
                    description: plainTextDescription,
                    sku: product._id,
                    mpn: product.batchNo || product._id,
                    brand: {
                        '@type': 'Brand',
                        name: product.brand || 'Pratham Herbs',
                    },
                    category: product.type || 'Ayurvedic',
                    offers: {
                        '@type': 'Offer',
                        url: productUrl,
                        priceCurrency: 'INR',
                        price: finalPrice,
                        priceValidUntil: '2030-12-31',
                        itemCondition: 'https://schema.org/NewCondition',
                        availability: inStockStatus,
                        seller: {
                            '@type': 'Organization',
                            name: 'Pratham Herbs',
                            url: siteUrl,
                        },
                    },
                    ...((product.numReviews > 0 && product.rating) ? {
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: product.rating,
                            reviewCount: product.numReviews,
                            bestRating: '5',
                            worstRating: '1',
                        }
                    } : {})
                };

                breadcrumbSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Home',
                            item: siteUrl,
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: product.type || 'Products',
                            item: `${siteUrl}/type/${encodeURIComponent((product.type || 'ayurvedic').toLowerCase())}`,
                        },
                        {
                            '@type': 'ListItem',
                            position: 3,
                            name: productTitle,
                            item: productUrl,
                        },
                    ],
                };
            }
        }
    } catch (err) {
        console.error('Failed to construct JSON-LD for product layout:', err);
    }

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
            )}
            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
            {children}
        </>
    );
}
