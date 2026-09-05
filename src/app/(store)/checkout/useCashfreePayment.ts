import { toast } from 'react-hot-toast';
import { createOrder, verifyPayment } from '@/services/paymentService';

interface CashfreePaymentOptions {
    activeAddress: any;
    cartItems: any[];
    subtotal: number;
    taxes: number;
    shipping: number;
    total: number;
    userEmail: string;
    setIsProcessingPayment: (val: boolean) => void;
    clearCart: () => void;
    router: any;
}

export const useCashfreePayment = () => {
    const handleCashfreePayment = async (optionsParams: CashfreePaymentOptions) => {
        const {
            activeAddress,
            cartItems,
            subtotal,
            taxes,
            shipping,
            total,
            userEmail,
            setIsProcessingPayment,
            clearCart,
            router
        } = optionsParams;

        if (!activeAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        setIsProcessingPayment(true);
        try {
            // 1. Create Cashfree order on the backend
            const orderData = {
                orderItems: cartItems.map((item: any) => ({
                    product: item.product._id,
                    name: item.product.name,
                    qty: item.quantity,
                    image: item.product.images?.[0] || item.product.image || '/placeholder.png',
                    price: item.product.discount > 0 ? Math.round(item.product.price * (1 - item.product.discount / 100)) : item.product.price
                })),
                shippingAddress: {
                    address: activeAddress.addressLine1 + (activeAddress.addressLine2 ? ', ' + activeAddress.addressLine2 : ''),
                    city: activeAddress.city,
                    postalCode: activeAddress.zip,
                    country: 'India',
                    addressLine1: activeAddress.addressLine1,
                    addressLine2: activeAddress.addressLine2 || '',
                    landmark: activeAddress.landmark || '',
                    state: activeAddress.state || '',
                    fullName: activeAddress.fullName,
                    phone: activeAddress.phone,
                },
                itemsPrice: subtotal,
                taxPrice: taxes,
                shippingPrice: shipping,
                totalPrice: total
            };

            const createdOrderResponse = await createOrder(orderData);

            // 2. Open Cashfree Checkout Modal / Drop-in
            if (typeof (window as any).Cashfree !== 'function') {
                toast.error('Cashfree SDK is loading. Please try again in a few seconds.');
                setIsProcessingPayment(false);
                return;
            }

            const cashfreeMode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
            const cashfree = (window as any).Cashfree({
                mode: cashfreeMode
            });

            const checkoutOptions = {
                paymentSessionId: createdOrderResponse.paymentSessionId,
                redirectTarget: "_modal"
            };

            cashfree.checkout(checkoutOptions).then(async (result: any) => {
                if (result.error) {
                    toast.error(result.error.message || 'Payment cancelled or failed');
                    setIsProcessingPayment(false);
                    router.push('/user/orders');
                    return;
                }

                // When modal closes or payment completes
                try {
                    setIsProcessingPayment(true);
                    await verifyPayment({
                        orderId: createdOrderResponse.order._id,
                        cashfreeOrderId: createdOrderResponse.cashfreeOrderId
                    });
                    toast.success('Payment successful!');
                    await clearCart();
                    router.push('/user/orders');
                } catch (verifyErr) {
                    console.error('Cashfree verify error:', verifyErr);
                    toast.error('Payment verification pending. Checking orders...');
                    router.push('/user/orders');
                } finally {
                    setIsProcessingPayment(false);
                }
            }).catch((err: any) => {
                console.error('Cashfree checkout promise error:', err);
                setIsProcessingPayment(false);
                router.push('/user/orders');
            });

        } catch (error: any) {
            toast.error('Failed to initiate Cashfree payment. Please try again.');
            console.error('Payment initiation error:', error);
            setIsProcessingPayment(false);
        }
    };

    return { handleCashfreePayment };
};
