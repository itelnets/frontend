import api from './api';

export const getWishlist = () => {
    return api.get('/wishlist');
};

export const addToWishlist = (productId: string) => {
    return api.post('/wishlist', { productId });
};

export const removeFromWishlist = (productId: string) => {
    return api.delete(`/wishlist/${productId}`);
};
