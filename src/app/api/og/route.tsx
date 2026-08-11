import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('image');

        if (!imageUrl) {
            return new Response('No image provided', { status: 400 });
        }

        let imageSrc: string | ArrayBuffer = imageUrl;
        try {
            const res = await fetch(imageUrl);
            if (res.ok) {
                imageSrc = await res.arrayBuffer();
            }
        } catch (e) {
            console.error('Failed to fetch image:', e);
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px', // Extra padding for square fit
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageSrc as any}
                        alt="Product Image"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            ),
            {
                width: 600,
                height: 600,
            }
        );
    } catch (e: any) {
        return new Response('Failed to generate image', { status: 500 });
    }
}
