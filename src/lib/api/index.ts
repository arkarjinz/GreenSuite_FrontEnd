import axios from 'axios';
import { LoginDto, RegisterDto, AuthUser } from "@/types/auth";
import { Company } from "@/types/company";
import axiosInstance from "@/lib/api/axiosInstance";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Define response interfaces
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

interface RegisterResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

interface RefreshResponse {
    accessToken: string;
    user: AuthUser;
}

export const authApi = {
    login: async (loginDto: LoginDto): Promise<LoginResponse> => {
        const response = await axiosInstance.post('/api/auth/login', loginDto);
        const responseData = response.data.data;

        return {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            user: {
                ...responseData.user,
                companyName: responseData.user.companyName || 'Company Name Not Set'
            }
        };
    },

    register: async (registerDto: RegisterDto): Promise<RegisterResponse> => {
        const response = await axiosInstance.post('/api/auth/register', registerDto);
        const responseData = response.data.data;

        return {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            user: {
                ...responseData.user,
                companyName: responseData.user.companyName || 'Company Name Not Set'
            }
        };
    },

    refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
        const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
        const responseData = response.data.data;
        return {
            accessToken: responseData.accessToken,
            user: {
                ...responseData.user,
                companyName: responseData.user.companyName || responseData.user.companyId || 'Company Name Not Set'
            }
        };
    }
};

export const passwordApi = {
    getSecurityQuestions: async (email: string): Promise<string[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/auth/recovery/forgot-password/${email}`);
        return response.data.questions;
    },

    verifyAnswers: async (email: string, answers: Record<string, string>): Promise<string> => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/recovery/verify-answers`, { email, answers });
        return response.data.resetToken;
    },

    resetPassword: async (resetToken: string, newPassword: string): Promise<void> => {
        await axios.post(`${API_BASE_URL}/api/auth/recovery/reset-password`, { resetToken, newPassword });
    }
};

export const companyApi = {
    searchCompanies: async (query: string): Promise<Company[]> => {
        const response = await axiosInstance.get(`/api/public/companies?query=${query}`);
        return response.data;
    },

    getCompanyById: async (companyId: string): Promise<Company> => {
        const response = await axiosInstance.get(`/api/public/companies/${companyId}`);
        return response.data;
    },
};

export const ownerApi = {
    getPendingUsers: async (): Promise<AuthUser[]> => {
        const response = await axiosInstance.get('/api/owner/pending-users');
        return response.data;
    },

    approveUser: async (userId: string): Promise<AuthUser> => {
        const response = await axiosInstance.post(`/api/owner/approve-user/${userId}`);
        return response.data;
    },

    rejectUser: async (userId: string): Promise<AuthUser> => {
        const response = await axiosInstance.post(`/api/owner/reject-user/${userId}`);
        return response.data;
    },
};