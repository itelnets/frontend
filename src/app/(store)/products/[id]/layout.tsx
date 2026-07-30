import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Fetch product from backend
        const res = await fetch(`${apiUrl}/products/${id}`);
        if (!res.ok) {
            return {
                title: 'Product Not Found',
            };
        }
        const product = await res.json();

        const imageUrl = product.images?.[0] 
            ? (product.images[0].startsWith('http') ? product.images[0] : `${apiUrl}/upload/file/${product.images[0]}`) 
            : "https://via.placeholder.com/600x600?text=No+Image+Available";

        const plainTextDescription = product.overview 
            ? product.overview.replace(/<[^>]*>?/gm, '').substring(0, 160) 
            : `Buy ${product.name} at our store!`;

        return {
            title: product.name,
            description: plainTextDescription,
            openGraph: {
                title: product.name,
                description: plainTextDescription,
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: product.name,
                    },
                ],
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
