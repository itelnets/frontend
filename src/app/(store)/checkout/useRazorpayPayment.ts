import { toast } from 'react-hot-toast';
import { createOrder, verifyPayment } from '@/services/paymentService';

interface RazorpayPaymentOptions {
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

export const useRazorpayPayment = () => {
    const handleRazorpayPayment = async (optionsParams: RazorpayPaymentOptions) => {
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
            // 1. Create order on the backend
            const orderData = {
                orderItems: cartItems.map((item: any) => ({
                    product: item.product._id,
                    name: item.product.name,
                    qty: item.quantity,
                    image: item.product.images?.[0] || '',
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
                    state: activeAddress.state || ''
                },
                itemsPrice: subtotal,
                taxPrice: taxes,
                shippingPrice: shipping,
                totalPrice: total
            };

            const createdOrderResponse = await createOrder(orderData);

            // 2. Open Razorpay Checkout modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: createdOrderResponse.amount,
                currency: createdOrderResponse.currency,
                name: 'Pratham Herbs',
                description: 'Order Payment',
                order_id: createdOrderResponse.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        setIsProcessingPayment(true);
                        // 3. Verify Payment Signature
                        const verificationData = {
                            orderId: createdOrderResponse.order._id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        };

                        await verifyPayment(verificationData);

                        toast.success('Payment successful!');
                        // Clear cart silently
                        await clearCart();
                        router.push('/user/orders'); // Redirect to orders page
                    } catch (error) {
                        toast.error('Payment verification failed');
                        console.error('Verify error:', error);
                        setIsProcessingPayment(false);
                    }
                },
                prefill: {
                    name: activeAddress.fullName,
                    email: userEmail,
                    contact: activeAddress.phone
                },
                theme: {
                    color: '#458500'
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessingPayment(false);
                        router.push('/user/orders');
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                toast.error(response.error?.description || 'Payment failed');
                setIsProcessingPayment(false);
                router.push('/user/orders');
            });

            rzp.open();
        } catch (error) {
            toast.error('Failed to initiate payment. Please try again.');
            console.error('Payment initiation error:', error);
            setIsProcessingPayment(false);
        }
    };

    return { handleRazorpayPayment };
};
