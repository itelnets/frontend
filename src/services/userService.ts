import api from './api';

export const fetchAdminUsers = async (page: number = 1, limit: number = 20, search: string = '') => {
    try {
        const response = await api.get('/users/admin/all', { params: { page, limit, search } });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin users:', error);
        throw error;
    }
};

export const toggleAdminUserStatus = async (userId: string, isDeleted: boolean) => {
    try {
        const response = await api.put(`/users/admin/${userId}/status`, { isDeleted });
        return response.data;
    } catch (error) {
        console.error('Error toggling user status:', error);
        throw error;
    }
};
