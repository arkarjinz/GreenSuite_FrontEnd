import axiosInstance from './axiosInstance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Add debug logging
console.log('🔧 API Configuration:', {
    API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
});

// Auth API
export const authApi = {
    // Test if backend is a Spring Boot application
    testSpringBootBackend: async (): Promise<{ isSpringBoot: boolean; details: any }> => {
        try {
            console.log('🔍 Testing if backend is Spring Boot...');
            const response = await axiosInstance.get('/');
            
            const headers = response.headers;
            const isSpringBoot = headers['x-application-context'] || 
                                headers['server']?.includes('Tomcat') ||
                                headers['server']?.includes('Jetty') ||
                                headers['server']?.includes('Undertow') ||
                                response.data?.includes('Spring Boot') ||
                                response.data?.includes('Whitelabel Error Page');
            
            console.log('🔍 Response headers:', headers);
            console.log('🔍 Response data preview:', typeof response.data === 'string' ? response.data.substring(0, 200) : 'Not a string');
            
            return {
                isSpringBoot: !!isSpringBoot,
                details: {
                    headers: headers,
                    status: response.status,
                    dataType: typeof response.data,
                    dataPreview: typeof response.data === 'string' ? response.data.substring(0, 200) : 'Not a string'
                }
            };
        } catch (error: any) {
            // If we get a 401 error, it means the backend is running but requires authentication
            if (error.response?.status === 401) {
                console.log('✅ Backend is running (requires authentication)');
                return {
                    isSpringBoot: true, // Assume it's Spring Boot if it's responding with 401
                    details: {
                        status: error.response.status,
                        error: 'Authentication required',
                        message: 'Backend is running but requires authentication'
                    }
                };
            }
            console.error('❌ Error testing Spring Boot backend:', error.message);
            return {
                isSpringBoot: false,
                details: { error: error.message }
            };
        }
    },

    // Test if backend is running on the expected port
    testBackendPort: async (): Promise<{ isRunning: boolean; port: string; error?: string }> => {
        const baseURL = axiosInstance.defaults.baseURL || API_BASE_URL;
        const url = new URL(baseURL);
        const port = url.port || (url.protocol === 'https:' ? '443' : '80');
        
        try {
            console.log(`🔍 Testing backend on port ${port}...`);
            const response = await axiosInstance.get('/');
            console.log('✅ Backend is running on port', port);
            return { isRunning: true, port };
        } catch (error: any) {
            // If we get a 401 error, it means the backend is running but requires authentication
            if (error.response?.status === 401) {
                console.log('✅ Backend is running on port', port, '(requires authentication)');
                return { isRunning: true, port, error: 'Authentication required' };
            }
            console.error(`❌ Backend is not running on port ${port}:`, error.message);
            return { isRunning: false, port, error: error.message };
        }
    },

    // Health check function to test backend connectivity
    healthCheck: async (): Promise<boolean> => {
        try {
            console.log('🏥 Testing backend connectivity...');
            // Try Spring Boot specific endpoints first
            const endpoints = [
                '/actuator/health',
                '/api/auth/health',
                '/health',
                '/'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`🔍 Trying endpoint: ${endpoint}`);
                    const response = await axiosInstance.get(endpoint);
                    console.log(`✅ Backend is reachable via ${endpoint}:`, response.status);
                    return true;
                } catch (endpointError: any) {
                    // If we get a 401 error, it means the backend is running but requires authentication
                    if (endpointError.response?.status === 401) {
                        console.log(`✅ Backend is reachable via ${endpoint} (requires authentication):`, endpointError.response.status);
                        return true;
                    }
                    console.log(`⚠️ Endpoint ${endpoint} not available:`, endpointError.message);
                    continue;
                }
            }
            
            console.error('❌ No backend endpoints are reachable');
            return false;
        } catch (error: any) {
            console.error('❌ Backend is not reachable:', error.message);
            return false;
        }
    },

    // Validate registration payload
    validateRegistrationPayload: (payload: any): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        // Check required fields
        const requiredFields = ['firstName', 'lastName', 'userName', 'email', 'password', 'companyRole', 'companyName'];
        requiredFields.forEach(field => {
            if (!payload[field] || payload[field].trim().length === 0) {
                errors.push(`${field} is required`);
            }
        });
        
        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (payload.email && !emailRegex.test(payload.email)) {
            errors.push('Invalid email format');
        }
        
        // Check password length
        if (payload.password && payload.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        // Check role-specific requirements
        if (payload.companyRole === 'OWNER') {
            if (!payload.companyAddress || payload.companyAddress.trim().length === 0) {
                errors.push('Company address is required for owners');
            }
            if (!payload.industry || payload.industry.trim().length === 0) {
                errors.push('Industry is required for owners');
            }
        } else {
            if (!payload.companyId || payload.companyId.trim().length === 0) {
                errors.push('Company selection is required for non-owners');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    register: async (registerDto: any): Promise<any> => {
        try {
            console.log('🚀 Sending registration request with data:', registerDto);
            console.log('🌐 Registration URL:', `${axiosInstance.defaults.baseURL}/api/auth/register`);
            
            // Validate payload before sending
            const validation = authApi.validateRegistrationPayload(registerDto);
            if (!validation.isValid) {
                console.error('❌ Registration payload validation failed:', validation.errors);
                throw new Error(`Registration validation failed: ${validation.errors.join(', ')}`);
            }
            
        const response = await axiosInstance.post('/api/auth/register', registerDto);
            console.log('✅ Registration successful:', response.data);
        return response.data;
        } catch (error: any) {
            console.error('❌ Registration failed:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            console.error('❌ Error message:', error.message);
            
            // Extract error message from response
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response?.data) {
                const backendError = error.response.data;
                if (backendError.message) {
                    errorMessage = backendError.message;
                } else if (backendError.error) {
                    errorMessage = backendError.error;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    },
    
    login: async (loginDto: { email: string; password: string }): Promise<any> => {
        try {
            console.log('🚀 Attempting login with:', { 
                email: loginDto.email, 
                url: `${API_BASE_URL}/api/auth/login` 
            });
            
            // Use a longer timeout for login requests
            const response = await axiosInstance.post('/api/auth/login', loginDto, {
                timeout: 60000 // 60 seconds for login
            });
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
                baseURL: error.config?.baseURL,
                code: error.code
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
            } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                throw new Error('Login request timed out. Please check your connection and try again.');
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

// Enhanced Payment API matching backend CustomPaymentService
export const paymentApi = {
    // Create a payment account for the current user
    createPaymentAccount: async (accountRequest: {
        accountName: string;
        currency?: string;
    }): Promise<any> => {
        try {
            console.log('🏦 Creating payment account...');
            
            // Check user approval status before creating account
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('👤 User approval status:', userData.approvalStatus);
                    
                    if (userData.approvalStatus !== 'APPROVED') {
                        console.log('🚫 User is not approved, cannot create payment account');
                        return {
                            success: false,
                            error: 'USER_NOT_APPROVED',
                            message: `Account approval required. Your account status is: ${userData.approvalStatus}. Please wait for approval before creating payment accounts.`
                        };
                    }
                } catch (e) {
                    console.error('❌ Failed to parse user data:', e);
                }
            }
            
            const response = await axiosInstance.post('/api/payment/account/create', {
                accountName: accountRequest.accountName || 'Primary Account',
                currency: accountRequest.currency || 'USD'
            });
            
            // Backend returns ApiResponse structure: { success: boolean, message: string, data: object }
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to create payment account'
                };
            }
        } catch (error: any) {
            console.error('Failed to create payment account:', error);
            
            // Handle specific error cases
            const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
            
            // Check for approval-related errors
            if (errorMessage.includes('not approved') || 
                errorMessage.includes('pending') || 
                errorMessage.includes('approval required')) {
                return {
                    success: false,
                    error: 'USER_NOT_APPROVED',
                    message: 'Your account must be approved before creating payment accounts. Please contact your administrator.'
                };
            }
            
            if (errorMessage.includes('already has a payment account')) {
                // User already has an account, try to get the existing one
                try {
                    const existingAccount = await paymentApi.getUserPaymentAccount();
                    if (existingAccount.success) {
                        return {
                            success: true,
                            data: existingAccount.data,
                            message: 'Using existing payment account'
                        };
                    }
                } catch (getError) {
                    console.error('Failed to get existing account:', getError);
                }
                
                return {
                    success: false,
                    error: 'ACCOUNT_EXISTS',
                    message: 'You already have a payment account. Please refresh the page.'
                };
            }
            
            throw new Error(errorMessage || 'Failed to create payment account');
        }
    },

    // Get user's payment account
    getUserPaymentAccount: async (): Promise<any> => {
        try {
            console.log('🏦 Making payment account request...');
            
            // Debug authentication state
            const token = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');
            console.log('🔑 Auth token present:', !!token);
            console.log('👤 User data present:', !!user);
            
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('👤 User role:', userData.companyRole);
                    console.log('👤 User ID:', userData.id);
                    console.log('�� Approval status:', userData.approvalStatus);
                    
                    // Check if user is approved before making payment requests
                    if (userData.approvalStatus !== 'APPROVED') {
                        console.log('🚫 User is not approved, cannot access payment features');
                        return {
                            success: false,
                            error: 'USER_NOT_APPROVED',
                            message: `Account approval required. Your account status is: ${userData.approvalStatus}. Please wait for approval before accessing payment features.`
                        };
                    }
                } catch (e) {
                    console.error('❌ Failed to parse user data:', e);
                }
            }
            
            const response = await axiosInstance.get('/api/payment/user/current/account');
            console.log('✅ Payment account response:', response.status, response.data);
            
            // Backend returns ApiResponse structure: { success: boolean, message: string, data: object }
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data // The actual data is nested in data.data
                };
            } else {
                return {
                    success: false,
                    error: 'NO_ACCOUNT_FOUND',
                    message: response.data.message || 'No payment account found'
                };
            }
        } catch (error: any) {
            console.error('❌ Payment account request failed:', error);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error data:', error.response?.data);
            console.error('❌ Error headers:', error.response?.headers);
            
            // Check if it's a "no account found" error
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
                console.log('🔍 400 Error message:', errorMessage);
                
                // Check for approval-related errors
                if (errorMessage.includes('not approved') || 
                    errorMessage.includes('pending') || 
                    errorMessage.includes('approval required')) {
                    return {
                        success: false,
                        error: 'USER_NOT_APPROVED',
                        message: 'Your account must be approved before accessing payment features. Please contact your administrator.'
                    };
                }
                
                if (errorMessage.includes('No active payment account found') || 
                    errorMessage.includes('not found')) {
                    return {
                        success: false,
                        error: 'NO_ACCOUNT_FOUND',
                        message: 'No payment account found. Please create one first.'
                    };
                }
            }
            
            // Check for authentication/authorization errors
            if (error.response?.status === 401) {
                console.error('🚫 Authentication failed - user not logged in or token expired');
                throw new Error('Authentication required. Please log in again.');
            }
            
            if (error.response?.status === 403) {
                console.error('🚫 Authorization failed - user does not have required permissions');
                throw new Error('You do not have permission to access payment features. Please contact your administrator.');
            }
            
            // For other errors, throw to be handled by caller
            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get payment account');
        }
    },

    // Get account statistics
    getAccountStatistics: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/account/statistics');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get account statistics:', error);
            throw new Error(error.response?.data?.message || 'Failed to get account statistics');
        }
    },

    // Deposit money to payment account
    deposit: async (depositRequest: {
        amount: number;
        paymentMethod: string;
        description?: string;
    }): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/payment/deposit', {
                amount: depositRequest.amount,
                paymentMethod: depositRequest.paymentMethod,
                description: depositRequest.description || 'Account deposit',
                currency: 'USD'
            });
            
            // Backend returns ApiResponse structure: { success: boolean, message: string, data: object }
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to process deposit'
                };
            }
        } catch (error: any) {
            console.error('Failed to process deposit:', error);
            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to process deposit');
        }
    },

    // Purchase credits using account balance
    purchaseCredits: async (purchaseRequest: {
        creditPackageId: string;
        amount: number;
    }): Promise<any> => {
        try {
            const response = await axiosInstance.post('/api/payment/credits/purchase', {
                creditPackageId: purchaseRequest.creditPackageId,
                amount: purchaseRequest.amount
            });
            
            // Backend returns ApiResponse structure: { success: boolean, message: string, data: object }
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to purchase credits'
                };
            }
        } catch (error: any) {
            console.error('Failed to purchase credits:', error);
            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to purchase credits');
        }
    },

    // Get available credit packages
    getCreditPackages: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/credits/packages');
            
            // Backend returns ApiResponse structure: { success: boolean, message: string, data: object }
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to get credit packages'
                };
            }
        } catch (error: any) {
            console.error('Failed to get credit packages:', error);
            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get credit packages');
        }
    },

    // Get credit pricing (alias for getCreditPackages for backward compatibility)
    getCreditPricing: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/credits/packages');
            
            // Backend returns ApiResponse structure: { success: boolean, message: string, data: object }
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Failed to get credit pricing'
                };
            }
        } catch (error: any) {
            console.error('Failed to get credit pricing:', error);
            throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to get credit pricing');
        }
    },

    // Get transaction history
    getTransactionHistory: async (page?: number, size?: number): Promise<any> => {
        try {
            const params = new URLSearchParams();
            if (page !== undefined) params.append('page', page.toString());
            if (size !== undefined) params.append('size', size.toString());
            
            const response = await axiosInstance.get(`/api/payment/transactions?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get transaction history:', error);
            throw new Error(error.response?.data?.message || 'Failed to get transaction history');
        }
    },

    // Get specific transaction by ID
    getTransaction: async (transactionId: string): Promise<any> => {
        try {
            const response = await axiosInstance.get(`/api/payment/transactions/${transactionId}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get transaction:', error);
            throw new Error(error.response?.data?.message || 'Failed to get transaction');
        }
    },

    // Get payment analytics dashboard
    getPaymentDashboard: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/payment/analytics/dashboard');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get payment dashboard:', error);
            throw new Error(error.response?.data?.message || 'Failed to get payment dashboard');
        }
    },

    // Get user analytics
    getUserAnalytics: async (days?: number): Promise<any> => {
        try {
            const params = new URLSearchParams();
            if (days !== undefined) params.append('days', days.toString());
            
            const response = await axiosInstance.get(`/api/payment/analytics/user?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get user analytics:', error);
            throw new Error(error.response?.data?.message || 'Failed to get user analytics');
        }
    },

    // Get fraud trends (admin only)
    getFraudTrends: async (days?: number): Promise<any> => {
        try {
            const params = new URLSearchParams();
            if (days !== undefined) params.append('days', days.toString());
            
            const response = await axiosInstance.get(`/api/payment/analytics/fraud-trends?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get fraud trends:', error);
            throw new Error(error.response?.data?.message || 'Failed to get fraud trends');
        }
    },

    // Legacy methods for backward compatibility - these will be removed later
    createPaymentAccountLegacy: async (initialBalance: number): Promise<any> => {
        return paymentApi.createPaymentAccount({
            accountName: 'Primary Account',
            currency: 'USD'
        });
    },

    depositToAccount: async (accountNumber: string, amount: number): Promise<any> => {
        return paymentApi.deposit({
            amount: amount,
            paymentMethod: 'ACCOUNT_BALANCE',
            description: `Deposit to account ${accountNumber}`
        });
    },

    quickDeposit: async (accountNumber: string, amountType: 'SMALL' | 'MEDIUM' | 'LARGE'): Promise<any> => {
        const amount = amountType === 'SMALL' ? 10.00 : 
                     amountType === 'MEDIUM' ? 25.00 : 
                     amountType === 'LARGE' ? 50.00 : 10.00;
        
        return paymentApi.deposit({
            amount: amount,
            paymentMethod: 'ACCOUNT_BALANCE',
            description: `Quick deposit - ${amountType.toLowerCase()}`
        });
    }
};

// Enhanced AI Credits API matching backend AICreditService
export const aiCreditsApi = {
    // Get user's current credit balance and stats
    getCreditBalance: async (): Promise<any> => {
        try {
            console.log('🔍 Making credit balance API call...');
            const timestamp = Date.now();
            const response = await axiosInstance.get(`/api/credits/balance?t=${timestamp}`);
            console.log('🔍 Credit balance response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit balance:', error);
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

    // Get credit usage statistics
    getCreditStats: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/stats');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit stats:', error);
            throw new Error(error.response?.data?.message || 'Failed to get credit stats');
        }
    },

    // Get credit history with pagination
    getCreditHistory: async (page?: number, size?: number): Promise<any> => {
        try {
            const params = new URLSearchParams();
            if (page !== undefined) params.append('page', page.toString());
            if (size !== undefined) params.append('size', size.toString());
            
            const response = await axiosInstance.get(`/api/credits/history?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit history:', error);
            throw new Error(error.response?.data?.message || 'Failed to load credit history');
        }
    },

    // Admin: Add credits to user account
    addCreditsToUser: async (userId: string, amount: number, reason?: string): Promise<any> => {
        try {
            const params = new URLSearchParams({ userId, amount: amount.toString() });
            if (reason) params.append('reason', reason);
            
            const response = await axiosInstance.post(`/api/credits/add?${params.toString()}`);
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
    },

    // Deduct credits for chat (this happens automatically on the backend)
    deductChatCredits: async (conversationId?: string, reason?: string): Promise<any> => {
        try {
            const params = new URLSearchParams();
            if (conversationId) params.append('conversationId', conversationId);
            if (reason) params.append('reason', reason);
            
            const response = await axiosInstance.post(`/api/credits/deduct-chat?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to deduct chat credits:', error);
            throw new Error(error.response?.data?.message || 'Failed to deduct credits');
        }
    },

    // Refund credits (e.g., if chat fails)
    refundCredits: async (amount: number, reason?: string, conversationId?: string): Promise<any> => {
        try {
            const params = new URLSearchParams({ amount: amount.toString() });
            if (reason) params.append('reason', reason);
            if (conversationId) params.append('conversationId', conversationId);
            
            const response = await axiosInstance.post(`/api/credits/refund?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to refund credits:', error);
            throw new Error(error.response?.data?.message || 'Failed to refund credits');
        }
    },

    // Legacy methods for backward compatibility
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

    getCreditPricing: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get('/api/credits/pricing');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get credit pricing:', error);
            throw new Error(error.response?.data?.message || 'Failed to load pricing information');
        }
    }
};

// Company API
export const companyApi = {
    searchCompanies: async (query: string): Promise<any[]> => {
        try {
            console.log('🔍 Searching companies with query:', query);
            const response = await axiosInstance.get(`/api/public/companies?query=${encodeURIComponent(query)}`);
            console.log('✅ Company search response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Company search failed:', error);
            if (error.response?.status === 400) {
                // If the backend doesn't support search without query, return empty array
                console.log('⚠️ Backend requires query parameter, returning empty results');
                return [];
            }
            throw error;
        }
    },

    getAllCompanies: async (): Promise<any[]> => {
        try {
            console.log('🔍 Getting all companies...');
            const response = await axiosInstance.get('/api/public/companies');
            console.log('✅ All companies response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get all companies failed:', error);
            // If the backend doesn't support getting all companies, return empty array
            return [];
        }
    },

    getCompanyById: async (companyId: string): Promise<any> => {
        try {
            console.log('🔍 Getting company by ID:', companyId);
            const response = await axiosInstance.get(`/api/public/companies/${companyId}`);
            console.log('✅ Company by ID response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get company by ID failed:', error);
            throw error;
        }
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