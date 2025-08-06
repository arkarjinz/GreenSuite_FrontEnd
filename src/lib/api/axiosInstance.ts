import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to inject token
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired) but be more careful about redirects
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    console.log('🔄 Attempting token refresh for 401 error...');
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                        refreshToken
                    });

                    if (response.data.accessToken) {
                        localStorage.setItem('accessToken', response.data.accessToken);
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                        
                        console.log('✅ Token refreshed successfully, retrying request');
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                        return axiosInstance(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                
                // Don't redirect for AI chat endpoints - let them handle errors gracefully
                const isAIChatRequest = originalRequest.url?.includes('/api/ai/');
                
                if (isAIChatRequest) {
                    console.log('🤖 AI chat request failed - not redirecting to login');
                    // Just remove tokens but don't redirect for AI chat
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    return Promise.reject(new Error('Authentication failed. Please refresh the page to re-authenticate.'));
                }
                
                // For other endpoints, clear tokens and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                
                // Only redirect if we're not already on an auth page
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith('/login') && 
                    !currentPath.startsWith('/register') && 
                    !currentPath.startsWith('/reapply')) {
                    console.log('🔄 Redirecting to login due to auth failure');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;