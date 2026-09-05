import api from './api';

export const createOrder = async (orderData: any) => {
    try {
        const response = await api.post('/payment/create-order', orderData, { timeout: 15000 });
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const verifyPayment = async (verificationData: any) => {
    try {
        const response = await api.post('/payment/verify', verificationData, { timeout: 15000 });
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};

export const refundOrder = async (orderId: string) => {
    try {
        const response = await api.post('/payment/refund', { orderId }, { timeout: 15000 });
        return response.data;
    } catch (error) {
        console.error('Error refunding order:', error);
        throw error;
    }
};

export const requestReturn = async (orderId: string) => {
    try {
        const response = await api.post(`/orders/${orderId}/request-return`, {}, { timeout: 15000 });
        return response.data;
    } catch (error) {
        console.error('Error requesting return:', error);
        throw error;
    }
};

export const rejectReturn = async (orderId: string) => {
    try {
        const response = await api.post(`/orders/admin/${orderId}/reject-return`, {}, { timeout: 15000 });
        return response.data;
    } catch (error) {
        console.error('Error rejecting return:', error);
        throw error;
    }
};
