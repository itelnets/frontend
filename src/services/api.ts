import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true, // Important for HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Access Token to headers
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // If 403 Forbidden (or 401 depending on backend), try to refresh
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post('/auth/refresh');
                // If successful, the new access token typically needs to be used.
                // If we simply rely on the cookie for the next request, that's fine?
                // No, the Access Token is usually a Bearer token in the header.
                // User needs to update their state with the new token.
                // This interceptor logic is complex without a state store reference.
                // For now, just return the failure so the UI can redirect to login.

                // BETTER: Just return a specific error or let the context handle it.
                // But if we want auto-refresh:

                // 1. Call refresh endpoint (which uses the cookie)
                // 2. Get new access token
                // 3. Update default headers or original request headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
