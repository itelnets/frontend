import api from './api';

export const submitDoctorRequest = async (data: {
    name: string;
    email: string;
    mobileNumber: string;
    registrationNumber: string;
    specialization: string;
    hospitalClinic?: string;
    documentUrl?: string;
}) => {
    const response = await api.post('/doctor/request', data);
    return response.data;
};

export const getDoctorStatus = async () => {
    const response = await api.get('/doctor/status');
    return response.data;
};

// Admin APIs
export const getAllDoctorRequests = async (status?: string) => {
    const url = status ? `/doctor/admin/requests?status=${status}` : `/doctor/admin/requests`;
    const response = await api.get(url);
    return response.data;
};

export const approveDoctorRequest = async (id: string, data?: { promoCode?: string; discountDetails?: string; adminNotes?: string }) => {
    const response = await api.put(`/doctor/admin/approve/${id}`, data || {});
    return response.data;
};

export const rejectDoctorRequest = async (id: string, adminNotes?: string) => {
    const response = await api.put(`/doctor/admin/reject/${id}`, { adminNotes });
    return response.data;
};
