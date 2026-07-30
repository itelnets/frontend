import { useState } from 'react';

interface SharePopoverProps {
    url: string;
}

export default function SharePopover({ url }: SharePopoverProps) {
    const [copied, setCopied] = useState(false);
    const [isLoggedIn] = useState(() => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('userInfo');
        }
        return false;
    });

    const handleCopy = () => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => console.error('Failed to copy text: ', err));
        } else {
            // Fallback for mobile/older browsers or non-secure contexts (HTTP)
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    };

    const shareOnWhatsApp = () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, '_blank');
    };

    return (
        <div className="absolute right-0 sm:right-0 top-10 w-[280px] sm:w-[320px] max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden cursor-default" onClick={e => e.stopPropagation()}>
            {/* Top Header */}
            <div className="bg-[#e48611] px-3 sm:px-4 py-2 sm:py-2.5 flex justify-between items-center text-white">
                <span className="font-bold text-sm">Share this product</span>
            </div>

            <div className="p-2 sm:p-4 bg-[#fdfcf5]">
                {isLoggedIn ? (
                    <div className="text-center text-[#458500] font-bold text-[13px] mb-4">
                        You are logged in. Share this product!
                    </div>
                ) : (
                    <div className="text-center mb-4 flex flex-col gap-1.5">
                        <div className="text-[#d32f2f] font-bold text-[13px]">
                            You are not logged in.
                        </div>
                        <div className="text-gray-800 font-bold text-[14px]">
                            Want to earn Rewards Credit?
                        </div>
                    </div>
                )}

                {/* Input and Copy Icon Button */}
                <div className="flex items-center border border-gray-300 rounded p-0.5 sm:p-1 mb-3 sm:mb-4 lg:mb-5">
                    <input
                        type="text"
                        value={url}
                        readOnly
                        className="flex-1 text-[13px] px-2 py-1 focus:outline-none text-gray-700 bg-transparent w-full"
                    />
                    <button
                        onClick={handleCopy}
                        className="p-1 sm:p-1.5 text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center justify-center cursor-pointer"
                        title="Copy link"
                    >
                        {copied ? (
                            <svg className="w-[18px] h-[18px] text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Social Media Icons (WhatsApp and Facebook only) */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={shareOnFacebook}
                        className="w-[38px] sm:w-[42px] h-[38px] sm:h-[42px] bg-[#3b5998] hover:bg-[#2d4373] text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        title="Share on Facebook"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                    </button>
                    <button
                        onClick={shareOnWhatsApp}
                        className="w-[38px] sm:w-[42px] h-[38px] sm:h-[42px] bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        title="Share on WhatsApp"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </button>
                </div>
            </div>

            {/* Pointer / Arrow */}
            <div className="absolute top-[-8px] right-6 w-4 h-4 bg-[#e48611] transform rotate-45"></div>
        </div>
    );
}
