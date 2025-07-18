import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {AuthUser, LoginDto, RegisterDto} from "@/types/auth";
import {authApi, passwordApi} from "@/lib/api";




interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (loginDto: LoginDto) => Promise<void>;
    register: (registerDto: RegisterDto) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<string[]>;
    verifySecurityAnswers: (email: string, answers: Record<string, string>) => Promise<string>;
    resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state
    const initializeAuth = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (!storedToken || !storedRefreshToken) {
            setIsLoading(false);
            return;
        }

        try {
            const { accessToken, user: userData } = await authApi.refreshToken(storedRefreshToken);
            localStorage.setItem('token', accessToken);
            setToken(accessToken);
            setUser(userData);
        } catch (error) {
            console.error('Token validation failed', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const handleAuthResponse = (
        accessToken: string,
        refreshToken: string,
        userData: AuthUser | undefined // Allow undefined
    ) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setToken(accessToken);
        setUser(userData || null); // Handle undefined case

        // Check if userData exists before accessing approvalStatus
        // if (userData?.approvalStatus === 'PENDING') {
        //     router.push('/pending');
        // } else if (userData) {
        //     router.push('/dashboard');
        // } else {
        //     // Handle missing user data scenario
        //     console.error('User data missing in authentication response');
        //     router.push('/login');
        // }
    };

    const login = async (loginDto: LoginDto) => {
        setIsLoading(true);
        try {

            const { accessToken, refreshToken, email, userName, roles } = await authApi.login(loginDto);
            const responseUser: AuthUser =  {
                email,
                userName,
                roles
            };
            console.log('Login response:', { accessToken, refreshToken, responseUser });
            handleAuthResponse(accessToken, refreshToken, responseUser);
            console.log('Login successful');
        } catch (error) {
            console.error('Login failed', error);
            throw new Error('Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (registerDto: RegisterDto) => {
        setIsLoading(true);
        try {
            const { accessToken, refreshToken, user: userData } = await authApi.register(registerDto);
            handleAuthResponse(accessToken, refreshToken, userData);
        } catch (error) {
            console.error('Registration failed', error);
            throw new Error('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    // Password recovery methods
    const forgotPassword = async (email: string): Promise<string[]> => {
        return await passwordApi.getSecurityQuestions(email);
    };

    const verifySecurityAnswers = async (
        email: string,
        answers: Record<string, string>
    ): Promise<string> => {
        return await passwordApi.verifyAnswers(email, answers);
    };

    const resetPassword = async (resetToken: string, newPassword: string) => {
        await passwordApi.resetPassword(resetToken, newPassword);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                forgotPassword,
                verifySecurityAnswers,
                resetPassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

