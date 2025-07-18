// import axios from 'axios';
//
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
//
// export const passwordApi = {
//     getPredefinedQuestions: async (): Promise<string[]> => {
//         const response = await axios.get(`${API_BASE_URL}/api/auth/recovery/predefined-questions`);
//         return response.data.questions;
//     },
//
//     setSecurityQuestions: async (token: string, questions: Record<string, string>): Promise<void> => {
//         await axios.post(
//             `${API_BASE_URL}/api/auth/recovery/set-questions`,
//             { questions },
//             { headers: { Authorization: `Bearer ${token}` } }
//         );
//     },
//
//     getSecurityQuestions: async (email: string): Promise<string[]> => {
//         const response = await axios.get(`${API_BASE_URL}/api/auth/recovery/forgot-password/${email}`);
//         return response.data.questions;
//     },
//
//     verifyAnswers: async (email: string, answers: Record<string, string>): Promise<string> => {
//         const response = await axios.post(`${API_BASE_URL}/api/auth/recovery/verify-answers`, { email, answers });
//         return response.data.resetToken;
//     },
//
//     resetPassword: async (resetToken: string, newPassword: string): Promise<void> => {
//         await axios.post(`${API_BASE_URL}/api/auth/recovery/reset-password`, { resetToken, newPassword });
//     }
// };