// import axios from 'axios';
// import * as process from "node:process";
// import {LoginDto, RegisterDto} from "@/types/auth";
//
//
//
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
//
// export const authApi = {
//     login: async (loginDto :  LoginDto ) => {
//         const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginDto);
//         return response.data;
//     },
//
//     register: async (registerDto: RegisterDto) => {
//         const response = await  axios.post(`${API_BASE_URL}/api/auth/register`, registerDto);
//         return response.data;
//     },
//
//     refreshToken: async (refreshToken: string) => {
//         const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
//         return response.data;
//     },
//
//     getCurrentUser: async (token: string) => {
//         const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         return response.data;
//     }
// };
//
// export * as passwordApi from './password';