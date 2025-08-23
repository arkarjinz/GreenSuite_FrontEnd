import axiosInstance from './axiosInstance';

// Admin-only API functions
export const adminApi = {
    // Trigger manual refill for user (Admin only)
    triggerManualRefill: async (userId: string): Promise<any> => {
        try {
            console.log('🔄 Admin triggering manual refill for user:', userId);
            const response = await axiosInstance.post('/api/refill/manual', null, {
                params: { userId }
            });
            
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
            console.error('Failed to trigger manual refill:', error);
            throw new Error(error.response?.data?.message || 'Failed to trigger manual refill');
        }
    },

    // Get all users (Admin only)
    getAllUsers: async (): Promise<any> => {
        try {
            console.log('👥 Admin getting all users...');
            const response = await axiosInstance.get('/api/admin/users');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get all users:', error);
            throw new Error(error.response?.data?.message || 'Failed to get all users');
        }
    },

    // Delete user (Admin only)
    deleteUser: async (userId: string): Promise<any> => {
        try {
            console.log('🗑️ Admin deleting user:', userId);
            const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete user');
        }
    },

    // Get all companies (Admin only)
    getAllCompanies: async (): Promise<any> => {
        try {
            console.log('🏢 Admin getting all companies...');
            const response = await axiosInstance.get('/api/admin/companies');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get all companies:', error);
            throw new Error(error.response?.data?.message || 'Failed to get all companies');
        }
    },

    // Delete company (Admin only)
    deleteCompany: async (companyId: string): Promise<any> => {
        try {
            console.log('🗑️ Admin deleting company:', companyId);
            const response = await axiosInstance.delete(`/api/admin/companies/${companyId}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to delete company:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete company');
        }
    },

    // Promote user to admin (Admin only)
    promoteToAdmin: async (userId: string): Promise<any> => {
        try {
            console.log('👑 Admin promoting user to admin:', userId);
            const response = await axiosInstance.post(`/api/admin/promote-to-admin/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to promote user to admin:', error);
            throw new Error(error.response?.data?.message || 'Failed to promote user to admin');
        }
    },

    // Reset admin password (Admin only)
    resetAdminPassword: async (userId: string, newPassword: string): Promise<any> => {
        try {
            console.log('🔐 Admin resetting admin password for user:', userId);
            const response = await axiosInstance.post('/api/admin/reset-admin-password', {
                userId,
                newPassword
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to reset admin password:', error);
            throw new Error(error.response?.data?.message || 'Failed to reset admin password');
        }
    },

    // Create global admin (Admin only)
    createGlobalAdmin: async (adminData: {
        firstName: string;
        lastName: string;
        userName: string;
        email: string;
        password: string;
    }): Promise<any> => {
        try {
            console.log('👑 Admin creating global admin:', adminData.email);
            const response = await axiosInstance.post('/api/admin/create-admin', adminData);
            return response.data;
        } catch (error: any) {
            console.error('Failed to create global admin:', error);
            throw new Error(error.response?.data?.message || 'Failed to create global admin');
        }
    },

    // Get banned users (Admin only)
    getBannedUsers: async (): Promise<any> => {
        try {
            console.log('🚫 Admin getting banned users...');
            const response = await axiosInstance.get('/api/admin/banned-users');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get banned users:', error);
            throw new Error(error.response?.data?.message || 'Failed to get banned users');
        }
    },

    // Get users approaching ban (Admin only)
    getUsersApproachingBan: async (): Promise<any> => {
        try {
            console.log('⚠️ Admin getting users approaching ban...');
            const response = await axiosInstance.get('/api/admin/users-approaching-ban');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get users approaching ban:', error);
            throw new Error(error.response?.data?.message || 'Failed to get users approaching ban');
        }
    },

    // Get ban statistics (Admin only)
    getBanStatistics: async (): Promise<any> => {
        try {
            console.log('📊 Admin getting ban statistics...');
            const response = await axiosInstance.get('/api/admin/ban-statistics');
            return response.data;
        } catch (error: any) {
            console.error('Failed to get ban statistics:', error);
            throw new Error(error.response?.data?.message || 'Failed to get ban statistics');
        }
    },

    // Unban user (Admin only)
    unbanUser: async (userId: string, reason?: string): Promise<any> => {
        try {
            console.log('✅ Admin unbanning user:', userId);
            const response = await axiosInstance.post(`/api/admin/unban-user/${userId}`, {
                reason: reason || 'No reason provided'
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to unban user:', error);
            throw new Error(error.response?.data?.message || 'Failed to unban user');
        }
    },

    // Ban user (Admin only)
    banUser: async (userId: string, reason?: string): Promise<any> => {
        try {
            console.log('🚫 Admin banning user:', userId);
            const response = await axiosInstance.post(`/api/admin/ban-user/${userId}`, {
                reason: reason || 'Manual ban by admin'
            });
            return response.data;
        } catch (error: any) {
            console.error('Failed to ban user:', error);
            throw new Error(error.response?.data?.message || 'Failed to ban user');
        }
    },

    // Get user rejection details (Admin only)
    getUserRejectionDetails: async (userId: string): Promise<any> => {
        try {
            console.log('📋 Admin getting user rejection details:', userId);
            const response = await axiosInstance.get(`/api/admin/user/${userId}/rejection-details`);
            return response.data;
        } catch (error: any) {
            console.error('Failed to get user rejection details:', error);
            throw new Error(error.response?.data?.message || 'Failed to get user rejection details');
        }
    }
}; 