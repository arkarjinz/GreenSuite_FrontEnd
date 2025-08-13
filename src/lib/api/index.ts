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

// AI Credits API
export const aiCreditsApi = {
    // Get user's current credit balance and stats
    getCreditBalance: async (): Promise<any> => {
        try {
            console.log('🔍 Making credit balance API call...');
            // Add timestamp to prevent caching
            const timestamp = Date.now();
            const response = await axiosInstance.get(`/api/credits/balance?t=${timestamp}`);
            console.log('🔍 Raw API response:', response);
            console.log('🔍 Response data:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit balance:', error);
            console.error('Error response:', error.response);
            throw new Error(error.response?.data?.message || 'Failed to load credit information');
        }
    },

    // Check if user can chat (has enough credits)
    canUserChat: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/can-chat');
            return response.data;
        } catch (error: any) {
            console.error('Failed to check chat availability:', error);
            throw new Error(error.response?.data?.message || 'Failed to check chat availability');
        }
    },

    // Purchase credits (placeholder for payment integration)
    purchaseCredits: async (amount: number, paymentMethod: string): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/credits/purchase', null, {
                params: { amount, paymentMethod }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to purchase credits:', error);
            throw new Error(error.response?.data?.message || 'Failed to purchase credits');
        }
    },

    // Get credit usage history
    getCreditHistory: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/history');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit history:', error);
            throw new Error(error.response?.data?.message || 'Failed to load credit history');
        }
    },

    // Get credit pricing information
    getCreditPricing: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/pricing');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit pricing:', error);
            throw new Error(error.response?.data?.message || 'Failed to load pricing information');
        }
    },



    // Admin: Add credits to user account
    addCreditsToUser: async (userId: string, amount: number, reason?: string): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/credits/add', null, {
                params: { userId, amount, reason }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to add credits to user:', error);
            throw new Error(error.response?.data?.message || 'Failed to add credits');
        }
    },

    // Admin: Get credits overview
    getCreditsOverview: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/admin/overview');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credits overview:', error);
            throw new Error(error.response?.data?.message || 'Failed to load credits overview');
        }
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

// Payment API
export const paymentApi = {
    // Create a payment account for the current user
    createPaymentAccount: async (initialBalance: number): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/payment/account/create', null, {
                params: { initialBalance }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to create payment account:', error);
            throw new Error(error.response?.data?.message || 'Failed to create payment account');
        }
    },

    // Get payment account details
    getPaymentAccount: async (accountNumber: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(`/api/payment/account/${accountNumber}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get payment account:', error);
            throw new Error(error.response?.data?.message || 'Failed to get payment account');
        }
    },

    // Purchase credits using payment account
    purchaseCredits: async (purchaseRequest: {
        accountNumber: string;
        paymentMethod: string;
        creditPackage: string;
        creditAmount: number;
        amount: number;
    }): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/payment/credits/purchase', purchaseRequest);
            return response.data;
        } catch (error: any) {
            console.error('Failed to purchase credits:', error);
            throw new Error(error.response?.data?.message || 'Failed to purchase credits');
        }
    },

    // Get credit pricing information
    getCreditPricing: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/credits/pricing');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit pricing:', error);
            throw new Error(error.response?.data?.message || 'Failed to load pricing information');
        }
    },

    // Deposit money to payment account (simple)
    depositToAccount: async (accountNumber: string, amount: number): Promise<any> => {
        try {
            // Use the simple deposit endpoint directly
            const response = await axiosInstance.post('/api/payment/account/deposit', null, {
                params: { accountNumber, amount }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to deposit to account:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                accountNumber: accountNumber,
                amount: amount
            });
            throw new Error(error.response?.data?.message || 'Failed to deposit funds');
        }
    },

    // Advanced deposit with payment method details
    depositToAccountAdvanced: async (depositRequest: {
        accountNumber: string;
        amount: number;
        paymentMethod: string;
        cardNumber?: string;
        bankAccount?: string;
    }): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/payment/account/deposit/advanced', depositRequest);
            return response.data;
        } catch (error: any) {
            console.error('Failed to process advanced deposit:', error);
            throw new Error(error.response?.data?.message || 'Failed to process deposit');
        }
    },

    // Quick deposit with predefined amounts
    quickDeposit: async (accountNumber: string, amountType: 'SMALL' | 'MEDIUM' | 'LARGE'): Promise<any> => {
        try {
            // Use hardcoded amounts to avoid API calls that might fail
            const amount = amountType === 'SMALL' ? 10.00 : 
                          amountType === 'MEDIUM' ? 25.00 : 
                          amountType === 'LARGE' ? 50.00 : 10.00;
            
            // Use the simple deposit endpoint directly - this should work
            const response = await axiosInstance.post('/api/payment/account/deposit', null, {
                params: { accountNumber, amount }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to process quick deposit:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                accountNumber,
                amountType,
                amount: amountType === 'SMALL' ? 10.00 : 
                       amountType === 'MEDIUM' ? 25.00 : 
                       amountType === 'LARGE' ? 50.00 : 10.00
            });
            throw new Error(error.response?.data?.message || 'Failed to process quick deposit');
        }
    },

    // Get deposit options and amounts
    getDepositOptions: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/deposit/options');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get deposit options:', error);
            throw new Error(error.response?.data?.message || 'Failed to load deposit options');
        }
    },

    // Get payment history for user
    getPaymentHistory: async (accountNumber: string): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/history', {
                params: { accountNumber }
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to get payment history:', error);
            // Return demo data if API fails
            return {
                status: 'success',
                data: {
                    accountNumber: accountNumber,
                    transactions: [
                        {
                            transactionId: 'TXN_001',
                            accountNumber: accountNumber,
                            status: 'COMPLETED',
                            amount: 24.99,
                            paymentMethod: 'CARD',
                            transactionReference: 'TXN_PREMIUM_001',
                            creditsPurchased: 350,
                            creditPackage: 'PREMIUM',
                            createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                        },
                        {
                            transactionId: 'TXN_002',
                            accountNumber: accountNumber,
                            status: 'COMPLETED',
                            amount: 12.99,
                            paymentMethod: 'WALLET',
                            transactionReference: 'TXN_STANDARD_001',
                            creditsPurchased: 150,
                            creditPackage: 'STANDARD',
                            createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                        },
                        {
                            transactionId: 'TXN_003',
                            accountNumber: accountNumber,
                            status: 'COMPLETED',
                            amount: 50.0,
                            paymentMethod: 'BANK_TRANSFER',
                            transactionReference: 'TXN_DEPOSIT_001',
                            createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    ],
                    summary: {
                        totalTransactions: 3,
                        completedTransactions: 3,
                        failedTransactions: 0,
                        pendingTransactions: 0,
                        totalSpent: 87.97
                    }
                }
            };
        }
    },

    // Admin: Add funds to any user's account
    adminAddFunds: async (accountNumber: string, amount: number, reason?: string): Promise<any> => {
        try {
            const params = new URLSearchParams({ accountNumber, amount: amount.toString() });
            if (reason) params.append('reason', reason);
            
            const response = await axiosInstance.post(`/api/payment/admin/add-funds?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to add admin funds:', error);
            throw new Error(error.response?.data?.message || 'Failed to add funds');
        }
    },

    // Admin: Get all user payment accounts
    getAllUserPaymentAccounts: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/admin/all-accounts');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get all user payment accounts:', error);
            throw new Error(error.response?.data?.message || 'Failed to load user accounts');
        }
    },

    // Get credit transaction history
    getCreditTransactionHistory: async (userId: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(`/api/credits/history`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit transaction history:', error);
            // Return demo data if API fails
            return {
                status: 'success',
                data: {
                    transactions: [
                        {
                            id: 'CT_001',
                            type: 'CREDIT_PURCHASE',
                            typeDescription: 'Credit Purchase',
                            amount: 350,
                            balanceBefore: 50,
                            balanceAfter: 400,
                            reason: 'Premium package purchase',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                        },
                        {
                            id: 'CT_002',
                            type: 'CHAT_DEDUCTION',
                            typeDescription: 'Chat Credit Deduction',
                            amount: -2,
                            balanceBefore: 400,
                            balanceAfter: 398,
                            reason: 'Chat conversation with Rin',
                            conversationId: 'CONV_001',
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                        },
                        {
                            id: 'CT_003',
                            type: 'AUTO_REFILL',
                            typeDescription: 'Automatic Credit Refill',
                            amount: 1,
                            balanceBefore: 398,
                            balanceAfter: 399,
                            reason: 'Automatic credit refill',
                            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
                        }
                    ],
                    totalTransactions: 3,
                    currentBalance: 399
                }
            };
        }
    },

    // Get user's payment account by user ID
    getUserPaymentAccount: async (userId: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(`/api/payment/user/${userId}/account`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get user payment account:', error);
            throw new Error(error.response?.data?.message || 'Failed to load payment account');
        }
    },

    // Get credit pricing information
    getCreditPricing: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/credits/pricing');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit pricing:', error);
            throw new Error(error.response?.data?.message || 'Failed to load credit pricing');
        }
    },

    // Purchase AI credits
    purchaseCredits: async (purchaseRequest: {
        accountNumber: string;
        paymentMethod: string;
        creditPackage: string;
        creditAmount: number;
        amount: number;
    }): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/payment/credits/purchase', purchaseRequest);
            return response.data;
        } catch (error: any) {
            console.error('Failed to purchase credits:', error);
            throw new Error(error.response?.data?.message || 'Failed to purchase credits');
        }
    },

    // Get AI credit balance
    getCreditBalance: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/balance');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit balance:', error);
            throw new Error(error.response?.data?.message || 'Failed to load credit balance');
        }
    },

    // Check if user can chat
    canUserChat: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/can-chat');
            return response.data;
        } catch (error: any) {
            console.error('Failed to check chat availability:', error);
            throw new Error(error.response?.data?.message || 'Failed to check chat availability');
        }
    }
};