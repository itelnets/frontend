import api from './api';

export const createProduct = async (productData: any) => {
    return api.post('/products', productData);
};

export const getProducts = async () => {
    return api.get('/products');
};

export const getProductById = async (id: string) => {
    return api.get(`/products/${id}`);
};

export const updateProduct = async (id: string, productData: any) => {
    return api.put(`/products/${id}`, productData);
};

export const deleteProduct = async (id: string) => {
    return api.delete(`/products/${id}`);
};

export const reorderProducts = async (orderedIds: string[]) => {
    return api.post('/products/reorder', { orderedIds });
};
