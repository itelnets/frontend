import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Important for HttpOnly cookies
    timeout: 15000, // 15 seconds timeout to allow backend serverless cold-starts and MongoDB connections
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Access Token to headers
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage depending on route
        let token = null;
        if (typeof window !== 'undefined') {
            const isAdminRoute = window.location.pathname.startsWith('/admin');
            const storageKey = isAdminRoute ? 'adminInfo' : 'userInfo';
            const infoStr = localStorage.getItem(storageKey);
            if (infoStr) {
                try {
                    const parsed = JSON.parse(infoStr);
                    token = parsed.token;
                } catch (e) { }
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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

        // Check if there is no response from the backend server (e.g. server is down/unreachable)
        if (!error.response) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('server-maintenance'));
            }
            // Return an unresolved promise so downstream catch blocks don't trigger Next.js dev overlay
            return new Promise(() => { });
        }

        if (error.response?.status === 401) {
            // Do not force a redirect if the user is already trying to log in
            if (originalRequest.url === '/auth/login' || originalRequest.url === '/auth/admin-login') {
                return Promise.reject(error);
            }

            let redirectUrl = '/login';
            if (typeof window !== 'undefined') {
                const isAdminRoute = window.location.pathname.startsWith('/admin');
                if (isAdminRoute) {
                    redirectUrl = '/admin/login';
                    localStorage.removeItem('adminInfo');
                } else {
                    localStorage.removeItem('userInfo');
                }
                window.location.href = redirectUrl;
            }
            return Promise.reject(error);
        }

        // If 403 Forbidden (or 401 depending on backend), try to refresh
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post('/auth/refresh');
                // Update storage if needed
                const isAdminRoute = window.location.pathname.startsWith('/admin');
                const storageKey = isAdminRoute ? 'adminInfo' : 'userInfo';
                const infoStr = localStorage.getItem(storageKey);
                if (infoStr) {
                    const info = JSON.parse(infoStr);
                    info.token = data.token;
                    localStorage.setItem(storageKey, JSON.stringify(info));
                }

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
