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
    const [isLoading, setIsLoading] = useState(true);
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

    // Initialize auth state
    const initializeAuth = useCallback(async () => {
        setIsLoading(true);
        const storedToken = localStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (!storedToken || !storedRefreshToken) {
            setIsLoading(false);
            setIsInitialized(true);
            return;
        }

        try {
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
    }, [logout]);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Handle redirects after auth initialization
    useEffect(() => {
        if (!isInitialized || isLoading) return;

        if (!user) {
            // Not authenticated, stay on current page
            return;
        }

        // Handle redirect based on approval status
        if (user.approvalStatus === 'PENDING') {
            if (window.location.pathname !== '/pending') {
                router.push('/pending');
            }
        } else {
            if (window.location.pathname !== '/dashboard') {
                router.push('/dashboard');
            }
        }
    }, [user, isInitialized, isLoading, router]);

    const handleAuthResponse = useCallback((
        accessToken: string,
        refreshToken: string,
        userData: AuthUser
    ) => {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setToken(accessToken);
        setUser(userData);
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