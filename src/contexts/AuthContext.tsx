import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, LoginDto, RegisterDto } from '@/types/auth';
import { authApi, passwordApi } from '@/lib/api';

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
    const [isLoading, setIsLoading] = useState(false); // Start as not loading
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    // Initialize auth state without blocking UI
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (!storedToken || !storedRefreshToken) {
                setIsInitialized(true);
                return;
            }

            try {
                setIsLoading(true);
                const response = await authApi.refreshToken(storedRefreshToken);
                localStorage.setItem('token', response.accessToken);
                setToken(response.accessToken);
                setUser(response.user);
            } catch (error) {
                console.error('Token validation failed', error);
                logout();
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        if (!isInitialized) {
            initializeAuth();
        }
    }, [isInitialized, logout]);

    // Handle redirects after auth initialization
    useEffect(() => {
        if (!isInitialized) return;

        if (!user) {
            // Not authenticated, stay on current page
            return;
        }

        // Handle redirect based on approval status
        const currentPath = window.location.pathname;
        if (user.approvalStatus === 'PENDING' && currentPath !== '/pending') {
            router.push('/pending');
        } else if (user.approvalStatus === 'APPROVED' && currentPath !== '/dashboard') {
            router.push('/dashboard');
        }
    }, [user, isInitialized, router]);

    const handleAuthResponse = useCallback((
        accessToken: string,
        refreshToken: string,
        userData: AuthUser
    ) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setToken(accessToken);
        setUser({
            ...userData,
            companyName: userData.companyName || userData.companyId || 'Company Name Not Set'
        });
    }, []);

    const login = async (loginDto: LoginDto) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(loginDto);
            handleAuthResponse(
                response.accessToken,
                response.refreshToken,
                response.user
            );
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
            const response = await authApi.register(registerDto);
            handleAuthResponse(
                response.accessToken,
                response.refreshToken,
                response.user
            );
        } catch (error) {
            console.error('Registration failed', error);
            throw new Error('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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