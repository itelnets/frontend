import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>
};

const getSiteUrl = () => (process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://prathamherbs.com').replace(/\/$/, '');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const siteUrl = getSiteUrl();
        const productUrl = `${siteUrl}/products/${id}`;

        if (!apiUrl) {
            return { title: 'Product Details' };
        }

        // Fetch product from backend
        const res = await fetch(`${apiUrl}/products/${id}`);
        if (!res.ok) {
            return {
                title: 'Product Not Found',
            };
        }

        let product;
        try {
            product = await res.json();
        } catch (e) {
            console.error("Failed to parse JSON response:", e);
            return { title: 'Product Details' };
        }

        const imageUrl = product.images?.[0]
            ? (product.images[0].startsWith('http') ? product.images[0] : `${apiUrl}/upload/file/${product.images[0]}`)
            : "https://via.placeholder.com/1200x630?text=No+Image+Available";

        const paddedImageUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&h=630&fit=contain&bg=white&filename=image.jpg`;

        const plainTextDescription = product.overview
            ? product.overview.replace(/<[^>]*>?/gm, '').substring(0, 160)
            : `Buy ${product.name} online at Pratham Herbs. 100% authentic Ayurvedic product.`;

        return {
            title: `${product.name} | Pratham Herbs`,
            description: plainTextDescription,
            keywords: [
                product.name,
                product.brand || 'Pratham Herbs',
                product.type || 'Ayurvedic',
                'Ayurvedic Product',
                'Buy ' + product.name,
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
                },
            },
            openGraph: {
                type: 'article',
                url: productUrl,
                title: product.name,
                description: plainTextDescription,
                siteName: 'Pratham Herbs',
                images: [
                    {
                        url: paddedImageUrl,
                        width: 1200,
                        height: 630,
                        alt: product.name,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description: plainTextDescription,
                images: [paddedImageUrl],
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
    let jsonLd = null;
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const siteUrl = getSiteUrl();
        const productUrl = `${siteUrl}/products/${id}`;

        if (apiUrl) {
            const res = await fetch(`${apiUrl}/products/${id}`);
            if (res.ok) {
                const product = await res.json();
                const imageUrl = product.images?.[0]
                    ? (product.images[0].startsWith('http') ? product.images[0] : `${apiUrl}/upload/file/${product.images[0]}`)
                    : `${siteUrl}/logo.png`;

                const finalPrice = product.discount > 0
                    ? Math.round(product.price * (1 - product.discount / 100))
                    : product.price;

                const plainTextDescription = product.overview
                    ? product.overview.replace(/<[^>]*>?/gm, '').substring(0, 300)
                    : `Buy ${product.name} at Pratham Herbs.`;

                jsonLd = {
                    '@context': 'https://schema.org',
                    '@type': 'Product',
                    name: product.name,
                    image: product.images?.map((img: string) => img.startsWith('http') ? img : `${apiUrl}/upload/file/${img}`) || [imageUrl],
                    description: plainTextDescription,
                    sku: product._id,
                    mpn: product._id,
                    brand: {
                        '@type': 'Brand',
                        name: product.brand || 'Pratham Herbs',
                    },
                    offers: {
                        '@type': 'Offer',
                        url: productUrl,
                        priceCurrency: 'INR',
                        price: finalPrice,
                        priceValidUntil: '2030-12-31',
                        itemCondition: 'https://schema.org/NewCondition',
                        availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        seller: {
                            '@type': 'Organization',
                            name: 'Pratham Herbs',
                        },
                    },
                    ...(product.numReviews > 0 && product.rating ? {
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: product.rating,
                            reviewCount: product.numReviews,
                        }
                    } : {})
                };
            }
        }
    } catch (err) {
        console.error('Failed to construct JSON-LD for product layout:', err);
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    );
}
