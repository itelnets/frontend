import api from './api';

export const getProfile = async (include?: string) => {
    const url = include ? `/users/profile?include=${include}` : '/users/profile';
    const { data } = await api.get(url);
    return data;
};

export const updateProfile = async (profileData: { name?: string; mobileNumber?: string }) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
};

export const requestEmailChange = async (newEmail: string) => {
    const { data } = await api.post('/users/change-email-request', { newEmail });
    return data;
};

export const verifyEmailChange = async (otp: string) => {
    const { data } = await api.post('/users/change-email-verify', { otp });
    return data;
};

export const forgotPassword = async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email }, { timeout: 15000 });
    return data;
};

export const deleteAccount = async () => {
    const { data } = await api.delete('/users/profile');
    return data;
};
