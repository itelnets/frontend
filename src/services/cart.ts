import api from './api';

export const getCart = () => {
    return api.get('/cart');
};

export const addToCart = (productId: string, quantity: number, saveForLater = false) => {
    return api.post('/cart', { productId, quantity, saveForLater });
};

export const updateCartItem = (productId: string, payload: { quantity?: number; saveForLater?: boolean }) => {
    return api.put(`/cart/${productId}`, payload);
};

export const removeFromCart = (productId: string) => {
    return api.delete(`/cart/${productId}`);
};

export const clearCart = () => {
    return api.delete('/cart');
};
