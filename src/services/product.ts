import api from './api';

export const createProduct = async (productData: any) => {
    return api.post('/products', productData);
};

export const getProducts = async (params: { search?: string; brand?: string; priceRanges?: string; minPrice?: number; maxPrice?: number; sort?: string; inStock?: string; categories?: string; ratings?: string; type?: string; includeFilters?: boolean } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.priceRanges) queryParams.append('priceRanges', params.priceRanges);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.inStock) queryParams.append('inStock', params.inStock);
    if (params.categories) queryParams.append('categories', params.categories);
    if (params.ratings) queryParams.append('ratings', params.ratings);
    if (params.type) queryParams.append('type', params.type);
    if (params.includeFilters) queryParams.append('includeFilters', 'true');

    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    return api.get(url);
};

export const getFilters = async (params: { type?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    const queryString = queryParams.toString();
    const url = queryString ? `/products/filters?${queryString}` : '/products/filters';
    return api.get(url);
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
