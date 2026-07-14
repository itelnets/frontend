import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const getAuthHeaders = () => {
    let token = '';
    if (typeof window !== 'undefined') {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedData = JSON.parse(userInfo);
                token = parsedData.token;
            } catch (e) {
                console.error("Error parsing auth data");
            }
        }
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchAddresses = async () => {
    try {
        const response = await axios.get(`${API_URL}/addresses`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

export const addAddress = async (addressData: any) => {
    try {
        const response = await axios.post(`${API_URL}/addresses`, addressData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

export const updateAddress = async (id: string, addressData: any) => {
    try {
        const response = await axios.put(`${API_URL}/addresses/${id}`, addressData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

export const removeAddress = async (id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/addresses/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error removing address:', error);
        throw error;
    }
};
