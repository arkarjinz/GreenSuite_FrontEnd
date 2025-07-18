import axios from 'axios';
import {LoginDto, RegisterDto} from "@/types/auth";
import {Company} from "@/types/company";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const authApi = {
    login: async (loginDto: LoginDto) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginDto,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        return response.data;
    },

    register: async (registerDto: RegisterDto) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, registerDto);
        return response.data;
    },

    refreshToken: async (refreshToken: string) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
        return response.data;
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