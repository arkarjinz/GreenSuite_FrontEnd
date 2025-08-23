import axiosInstance from './axiosInstance';

// Enhanced Refill Timing API matching backend RefillTimingController
export const refillApi = {
    // Get current refill timing configuration
    getRefillTiming: async (): Promise<any> => {
        try {
            console.log('⏰ Getting refill timing configuration...');
            const response = await axiosInstance.get('/api/refill/timing');
            
            // Handle backend ApiResponse format
            if (response.data && response.data.status === 'success' && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Failed to get refill timing:', error);
            throw new Error(error.response?.data?.message || 'Failed to get refill timing configuration');
        }
    },

    // Get refill statistics for current user
    getRefillStats: async (): Promise<any> => {
        try {
            console.log('📊 Getting refill statistics...');
            const response = await axiosInstance.get('/api/refill/stats');
            
            // Handle backend ApiResponse format
            if (response.data && response.data.status === 'success' && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Failed to get refill statistics:', error);
            throw new Error(error.response?.data?.message || 'Failed to get refill statistics');
        }
    },

    // Get refill history for current user
    getRefillHistory: async (page?: number, size?: number): Promise<any> => {
        try {
            console.log('📜 Getting refill history...');
            const params = new URLSearchParams();
            if (page !== undefined) params.append('page', page.toString());
            if (size !== undefined) params.append('size', size.toString());
            
            const response = await axiosInstance.get(`/api/refill/history?${params.toString()}`);
            
            // Handle backend ApiResponse format
            if (response.data && response.data.status === 'success' && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Failed to get refill history:', error);
            throw new Error(error.response?.data?.message || 'Failed to get refill history');
        }
    },

    // Get system-wide refill analytics (Admin only)
    getRefillAnalytics: async (): Promise<any> => {
        try {
            console.log('📈 Getting refill analytics...');
            const response = await axiosInstance.get('/api/refill/analytics');
            
            // Handle backend ApiResponse format
            if (response.data && response.data.status === 'success' && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Failed to get refill analytics:', error);
            throw new Error(error.response?.data?.message || 'Failed to get refill analytics');
        }
    },



    // Get refill status for all users (Admin only)
    getAllUsersRefillStatus: async (): Promise<any> => {
        try {
            console.log('👥 Getting all users refill status...');
            const response = await axiosInstance.get('/api/refill/status/all');
            
            // Handle backend ApiResponse format
            if (response.data && response.data.status === 'success' && response.data.data) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Failed to get all users refill status:', error);
            throw new Error(error.response?.data?.message || 'Failed to get refill status');
        }
    }
}; 