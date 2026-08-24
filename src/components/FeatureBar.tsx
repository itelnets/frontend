'use client';

export default function FeatureBar() {
    const features = [
        {
            id: 'dr-corner',
            title: 'Dr. Corner',
            subtitle: 'Free Doctor Consultation',
            icon: (
                <img
                    src="/doctor_logo.svg"
                    alt="Dr. Corner"
                    className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 mb-2.5 sm:mb-3 object-contain"
                />
            )
        },
        {
            id: 'free-delivery',
            title: 'Free Delivery',
            subtitle: 'On Orders Above Rs999/- Across India',
            icon: (
                <svg className="w-8 h-8 sm:w-11 sm:h-11 text-[#458500] shrink-0 mb-2.5 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13C10.895 21 10 20.105 10 19c0-1.105.895-2 2-2s2 .895 2 2c0 1.105-.895 2-2 2zM5 8h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" />
                </svg>
            )
        },
        {
            id: 'easy-return',
            title: '15 Days Return',
            subtitle: 'For defective or damaged Items',
            icon: (
                <svg className="w-8 h-8 sm:w-11 sm:h-11 text-[#458500] shrink-0 mb-2.5 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            )
        },
        {
            id: 'secure-payment',
            title: 'Secure Payment',
            subtitle: '100% Safe & Protected',
            icon: (
                <svg className="w-8 h-8 sm:w-11 sm:h-11 text-[#458500] shrink-0 mb-2.5 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    return (
        <div className="w-full bg-white pt-0 sm:pt-2 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-1 sm:gap-y-7 gap-x-1 sm:gap-x-4 sm:gap-8">
                    {features.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col items-center justify-start text-center p-1 sm:p-2"
                        >
                            {item.icon}
                            <span className="text-[12px] sm:text-base font-bold text-gray-900 leading-tight mb-1 sm:mb-1.5">
                                {item.title}
                            </span>
                            <span className="text-[10px] sm:text-sm text-gray-500 leading-snug max-w-[210px]">
                                {item.subtitle}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
