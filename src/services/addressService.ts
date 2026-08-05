import api from './api';

export const fetchAddresses = async () => {
    try {
        const response = await api.get('/addresses');
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

export const addAddress = async (addressData: any) => {
    try {
        const response = await api.post('/addresses', addressData);
        return response.data;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

export const updateAddress = async (id: string, addressData: any) => {
    try {
        const response = await api.put(`/addresses/${id}`, addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

export const removeAddress = async (id: string) => {
    try {
        const response = await api.delete(`/addresses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error removing address:', error);
        throw error;
    }
};
