import axios from 'axios';
import { LoginDto, RegisterDto, AuthUser } from "@/types/auth";
import { Company } from "@/types/company";

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
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginDto, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Extract data from backend's ApiResponse structure
        const responseData = response.data.data;

        // Ensure user object has approvalStatus
        if (!responseData.user || responseData.user.approvalStatus === undefined) {
            console.error('Invalid login response:', response.data);
            throw new Error('Invalid user data in login response');
        }

        return {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            user: responseData.user
        };
    },

    register: async (registerDto: RegisterDto): Promise<RegisterResponse> => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, registerDto);

        // Extract data from backend's ApiResponse structure
        const responseData = response.data.data;

        // Ensure user object has approvalStatus
        if (!responseData.user || responseData.user.approvalStatus === undefined) {
            console.error('Invalid register response:', response.data);
            throw new Error('Invalid user data in register response');
        }

        return {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            user: responseData.user
        };
    },

    refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

        // Extract data from backend's ApiResponse structure
        const responseData = response.data.data;

        // Ensure user object has approvalStatus
        if (!responseData.user || responseData.user.approvalStatus === undefined) {
            console.error('Invalid refresh response:', response.data);
            throw new Error('Invalid user data in refresh token response');
        }

        return {
            accessToken: responseData.accessToken,
            user: responseData.user
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
        const response = await axios.get(`${API_BASE_URL}/api/public/companies?query=${query}`);
        return response.data;
    },
};