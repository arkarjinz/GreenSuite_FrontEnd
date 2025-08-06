import axiosInstance from './axiosInstance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Add debug logging
console.log('🔧 API Configuration:', {
    API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
});

// Auth API
export const authApi = {
    register: async (registerDto: any): Promise<any> => {
        const response = await axiosInstance.post('/api/auth/register', registerDto);
        return response.data;
    },
    
    login: async (loginDto: { email: string; password: string }): Promise<any> => {
        try {
            console.log('🚀 Attempting login with:', { 
                email: loginDto.email, 
                url: `${API_BASE_URL}/api/auth/login` 
            });
            
            const response = await axiosInstance.post('/api/auth/login', loginDto);
            console.log('✅ Login response received:', {
                status: response.status,
                headers: response.headers,
                dataKeys: Object.keys(response.data || {})
            });
            
            // Handle both success and pending approval responses
            const responseData = response.data;
            
            // Check if it's a successful login with tokens
            if (responseData.data && responseData.data.accessToken) {
                // Store tokens
                localStorage.setItem('accessToken', responseData.data.accessToken);
                localStorage.setItem('refreshToken', responseData.data.refreshToken);
                
                console.log('✅ Tokens stored successfully');
                
        return {
                    success: true,
                    data: responseData.data,
                    user: responseData.data.user,
                    accessToken: responseData.data.accessToken,
                    refreshToken: responseData.data.refreshToken
                };
            }
            
            // Handle pending approval or other status responses
            if (responseData.data && responseData.data.status === 'pending') {
                console.log('⏳ User pending approval');
                return {
                    success: false,
                    status: 'pending',
                    data: responseData.data,
                    user: responseData.data.user,
                    message: responseData.data.message || 'Account pending approval'
                };
            }
            
            // Fallback for unexpected response structure
            console.log('🤔 Unexpected response structure:', responseData);
            return {
                success: responseData.success !== false,
                data: responseData.data || responseData,
                message: responseData.message
            };
            
        } catch (error: any) {
            console.error('❌ Login error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL
            });
            
            // Handle specific error responses
            if (error.response?.status === 401) {
                throw new Error('Invalid email or password');
            } else if (error.response?.status === 403) {
                throw new Error('Account access denied');
            } else if (error.response?.status === 404) {
                throw new Error('Login endpoint not found - check if backend is running');
            } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
                throw new Error('Cannot connect to backend - make sure Spring Boot server is running on port 8080');
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error(`Login failed: ${error.message}`);
            }
        }
    },
    
    refreshToken: async (refreshToken: string): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
            
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            return response.data;
        } catch (error: any) {
            // Clear tokens on refresh failure
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw error;
        }
    },

    // Updated reapply method according to backend implementation
    reapply: async (reapplyDto: { 
        token: string; 
        companyName: string; 
        companyRole: string; 
        password: string; 
    }): Promise<any> => {
        const response = await axiosInstance.post('/api/auth/reapply', reapplyDto);
        return response.data;
    }
};

// Company API
export const companyApi = {
    searchCompanies: async (query: string): Promise<any[]> => {
        const response = await axiosInstance.get(`/api/companies/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    getAllCompanies: async (): Promise<any[]> => {
        const response = await axiosInstance.get('/api/companies');
        return response.data;
    },

    getCompanyById: async (companyId: string): Promise<any> => {
        const response = await axiosInstance.get(`/api/companies/${companyId}`);
        return response.data;
    }
};

// Owner API
export const ownerApi = {
    getPendingUsers: async (): Promise<any[]> => {
        const response = await axiosInstance.get('/api/owner/pending-users');
        return response.data;
    },

    getRejectedUsers: async (): Promise<any[]> => {
        // For now, we get rejected users through company stats
        // The backend returns rejected users count but not the actual users
        // This would need a new backend endpoint: GET /api/owner/rejected-users
        try {
            const response = await axiosInstance.get('/api/owner/company-stats');
            const stats = response.data;
            // The backend currently only returns count, not actual rejected users
            // Return empty array for now until backend endpoint is implemented
            return [];
        } catch (error) {
            console.error('Failed to get rejected users:', error);
            throw new Error('Rejected users data is not currently available through the API. Check your pending users for any reapplicants.');
        }
    },
    
    approveUser: async (userId: string): Promise<any> => {
        const response = await axiosInstance.post(`/api/owner/approve-user/${userId}`);
        return response.data;
    },

    rejectUser: async (userId: string, reason?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (reason) params.append('reason', reason);
        
        const response = await axiosInstance.post(`/api/owner/reject-user/${userId}?${params.toString()}`);
        return response.data;
    },
    
    getUserRejectionHistory: async (userId: string): Promise<any[]> => {
        const response = await axiosInstance.get(`/api/owner/user/${userId}/rejection-history`);
        return response.data;
    },
    
    getCompanyStats: async (): Promise<any> => {
        const response = await axiosInstance.get('/api/owner/company-stats');
        return response.data;
    }
};

// Enhanced AI Chat API with streaming support
export const aiChatApi = {
    // Get or create persistent conversation ID for user
    getPersistentConversationId: async (userId: string): Promise<{ conversationId: string; isNew: boolean }> => {
        try {
            const response = await axiosInstance.get(`/api/ai/conversation/persistent/${userId}`);
            return response.data;
        } catch (error: any) {
            // If no conversation exists, create one
            if (error.response?.status === 404) {
                const createResponse = await axiosInstance.post(`/api/ai/conversation/persistent/${userId}`);
                return createResponse.data;
            }
            throw error;
        }
    },

    // Load user's chat history for their persistent conversation
    loadUserChatHistory: async (conversationId: string, userId: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(`/api/ai/conversation/${conversationId}/history?userId=${userId}`);
            return response.data;
        } catch (error: any) {
            // If no history exists, return empty array
            if (error.response?.status === 404) {
                return { messages: [] };
            }
            throw error;
        }
    },

    // Streaming chat endpoint
    streamChat: async (message: string, conversationId?: string, userId?: string, sessionId?: string): Promise<ReadableStream> => {
        const params = new URLSearchParams({ message });
        if (conversationId) params.append('conversationId', conversationId);
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        
        const token = localStorage.getItem('accessToken');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/chat?${params.toString()}`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            
            if (response.status === 401) {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    try {
                        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refreshToken }),
                        });
                        
                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            if (refreshData.accessToken) {
                                localStorage.setItem('accessToken', refreshData.accessToken);
                                localStorage.setItem('refreshToken', refreshData.refreshToken);
                                
                                // Retry original request with new token
                                const retryResponse = await fetch(`${API_BASE_URL}/api/ai/chat?${params.toString()}`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${refreshData.accessToken}`,
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                    },
                                });
                                
                                if (!retryResponse.ok) {
                                    throw new Error(`HTTP error! status: ${retryResponse.status}`);
                                }
                                
                                return retryResponse.body as ReadableStream;
                            }
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        // Don't redirect for AI chat - let the component handle the error
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        throw new Error('Authentication failed. Please refresh the page to re-authenticate.');
                    }
                }
                throw new Error('Authentication required. Please refresh the page to re-authenticate.');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.body as ReadableStream;
        } catch (error) {
            console.error('Stream chat error:', error);
            throw error;
        }
    },

    // Synchronous chat endpoint
    chat: async (message: string, conversationId?: string, userId?: string, sessionId?: string): Promise<any> => {
        const params = new URLSearchParams({ message });
        if (conversationId) params.append('conversationId', conversationId);
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        
        const response = await axiosInstance.post(`/api/ai/chat/sync?${params.toString()}`);
        return response.data;
    },

    // Get chat history
    getChatHistory: async (conversationId: string, userId?: string, sessionId?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        
        const response = await axiosInstance.get(`/api/ai/memory/${conversationId}?${params.toString()}`);
        return response.data;
    },

    // Clear chat history
    clearChatHistory: async (conversationId: string, userId?: string, sessionId?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        
        const response = await axiosInstance.delete(`/api/ai/memory/${conversationId}?${params.toString()}`);
        return response.data;
    },

    // Get Rin's personality state
    getRinPersonality: async (conversationId: string, userId?: string, sessionId?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        
        const response = await axiosInstance.get(`/api/ai/rin/personality/${conversationId}?${params.toString()}`);
        return response.data;
    },

    // Boost relationship with Rin
    boostRinRelationship: async (conversationId: string, userId?: string, sessionId?: string, reason?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        if (reason) params.append('reason', reason);
        
        const response = await axiosInstance.post(`/api/ai/rin/mood/boost/${conversationId}?${params.toString()}`);
        return response.data;
    },

    // Get environmental tips from Rin
    getEnvironmentalTips: async (): Promise<any> => {
        const response = await axiosInstance.get('/api/ai/rin/environmental-tips');
        return response.data;
    },

    // Analyze conversation context
    analyzeContext: async (conversationId: string, userId?: string, sessionId?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (sessionId) params.append('sessionId', sessionId);
        
        const response = await axiosInstance.post(`/api/ai/context/analyze/${conversationId}?${params.toString()}`);
        return response.data;
    },

    // Clear all context cache
    clearContextCache: async (): Promise<any> => {
        const response = await axiosInstance.post('/api/ai/cache/clear');
        return response.data;
    }
};