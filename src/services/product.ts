import api from './api';

export const createProduct = async (productData: any) => {
    return api.post('/products', productData);
};

export const getProducts = async (params: { search?: string; brand?: string; minPrice?: string; maxPrice?: string; sort?: string; inStock?: string; categories?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.inStock) queryParams.append('inStock', params.inStock);
    if (params.categories) queryParams.append('categories', params.categories);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    return api.get(url);
};

export const getFilters = async () => {
    return api.get('/products/filters');
};

export const getProductById = async (id: string) => {
    return api.get(`/products/${id}?t=${new Date().getTime()}`);
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
