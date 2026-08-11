import { Metadata } from 'next';
import { headers } from 'next/headers';

type Props = {
    params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

        // Use wsrv.nl to perfectly pad the image into a 1200x630 landscape for WhatsApp's large layout
        // Added &filename=image.jpg so WhatsApp's parser sees the .jpg extension
        const paddedImageUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&h=630&fit=contain&bg=white&filename=image.jpg`;

        const plainTextDescription = product.overview
            ? product.overview.replace(/<[^>]*>?/gm, '').substring(0, 160)
            : `Buy ${product.name} at our store!`;

        return {
            title: product.name,
            description: plainTextDescription,
            openGraph: {
                type: 'article',
                title: product.name,
                description: plainTextDescription,
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

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
