import api from './api';

export const fetchMyOrders = async (page: number = 1, limit: number = 10, status: string = 'All') => {
    try {
        const response = await api.get('/orders/myorders', { params: { page, limit, status } });
        return response.data;
    } catch (error) {
        console.error('Error fetching my orders:', error);
        throw error;
    }
};

export const fetchOrderById = async (id: string) => {
    try {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
};

export const fetchAllOrders = async (page: number = 1, limit: number = 20, status: string = 'All', search: string = '') => {
    try {
        const response = await api.get('/orders/admin/all', { params: { page, limit, status, search } });
        return response.data;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};
