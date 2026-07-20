import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
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
            // Do not force a redirect if the user is already trying to log in
            if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/admin-login') {
                return Promise.reject(error);
            }

            let redirectUrl = '/login';
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                try {
                    const userInfo = JSON.parse(userInfoStr);
                    if (userInfo.role === 'admin' || userInfo.role === 'Admin') {
                        redirectUrl = '/admin/login';
                    }
                } catch (e) {}
            }

            localStorage.removeItem('userInfo');
            if (typeof window !== 'undefined') {
                window.location.href = redirectUrl;
            }
            return Promise.reject(error);
        }

        // If 403 Forbidden (or 401 depending on backend), try to refresh
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post('/auth/refresh');
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
