"use client"
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    companyId: string;
    companyName?: string;
    companyRole: string;
    globalAdmin: boolean;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionCount?: number;
    isBanned?: boolean;
    aiCredits?: number;
    canChat?: boolean;
    isLowOnCredits?: boolean;
}

interface LoginDto {
    email: string;
    password: string;
}

interface RegisterDto {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    companyName: string;
    companyAddress?: string;
    industry?: string;
    companyRole: string;
    companyId?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (loginDto: LoginDto) => Promise<{ success: boolean; status?: string; message?: string }>;
    register: (registerDto: RegisterDto) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    // Update user function
    const updateUser = useCallback((updatedUser: AuthUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    // Logout function
    const logout = useCallback(() => {
        // Set loading state to prevent flash of content
        setIsLoading(true);
        
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('reapplicationToken');
        localStorage.removeItem('rejectionInfo');
        
        // Clear state
        setToken(null);
        setUser(null);
        
        // Immediate redirect to prevent flash
        router.push('/login');
        
        // Reset loading after a brief delay
        setTimeout(() => setIsLoading(false), 100);
    }, [router]);

    // Initialize auth state without blocking UI
    useEffect(() => {
        const initializeAuth = async () => {
            // DEVELOPMENT: Uncomment the next line to disable auth persistence
            // localStorage.clear(); return setIsInitialized(true);
            
            const storedToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            const storedUser = localStorage.getItem('user');

            if (!storedToken || !storedRefreshToken) {
                setIsInitialized(true);
                return;
            }

            // Try to use stored user data first to avoid unnecessary API calls
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setToken(storedToken);
                    setIsInitialized(true);
                    return; // Don't need to refresh token immediately
                } catch (error) {
                    console.error('Failed to parse stored user data:', error);
                    // Continue with token refresh if stored user data is invalid
                }
            }

            try {
                setIsLoading(true);
                const response = await authApi.refreshToken(storedRefreshToken);
                
                if (response.accessToken) {
                    localStorage.setItem('accessToken', response.accessToken);
                    if (response.refreshToken) {
                        localStorage.setItem('refreshToken', response.refreshToken);
                    }
                    setToken(response.accessToken);
                    
                    if (response.user) {
                        setUser(response.user);
                        localStorage.setItem('user', JSON.stringify(response.user));
                    } else {
                        // If no user data in response, try to keep the stored user
                        if (storedUser) {
                            try {
                                const userData = JSON.parse(storedUser);
                                setUser(userData);
                            } catch (error) {
                                console.error('Failed to parse stored user data:', error);
                                logout();
                                return;
                            }
                        } else {
                            logout();
                            return;
                        }
                    }
                } else {
                    logout();
                }
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

    // Handle redirects after auth initialization - LESS AGGRESSIVE VERSION
    useEffect(() => {
        if (!isInitialized || isLoading) return;

        const currentPath = window.location.pathname;
        
        // If user is not authenticated
        if (!user || !token) {
            // Only redirect to login if they're on a protected page
            const isPublicPage = currentPath.startsWith('/login') || 
                                currentPath.startsWith('/register') || 
                                currentPath.startsWith('/reapply') ||
                                currentPath.startsWith('/pending') ||
                                currentPath.startsWith('/rejected') ||
                                currentPath === '/';
            
            if (!isPublicPage) {
                console.log('Redirecting to login - no auth on protected page');
                router.push('/login');
            }
            return;
        }

        // User is authenticated - handle status-based redirects ONLY for auth pages
        if (user.approvalStatus === 'PENDING') {
            if (currentPath.startsWith('/login') || currentPath.startsWith('/register')) {
                router.push('/pending');
            }
        } else if (user.approvalStatus === 'REJECTED') {
            if (currentPath.startsWith('/login') || currentPath.startsWith('/register')) {
                router.push('/rejected');
            }
        } else if (user.approvalStatus === 'APPROVED') {
            if (currentPath.startsWith('/login') || currentPath.startsWith('/register')) {
                router.push('/dashboard');
            }
            // Allow free navigation to all other pages
        }
    }, [user, token, isInitialized, isLoading, router]);

    const handleAuthResponse = useCallback((
        accessToken: string,
        refreshToken: string,
        userData: AuthUser
    ) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data
        setToken(accessToken);
        setUser({
            ...userData,
            companyName: userData.companyName || 'Company Name Not Set'
        });
    }, []);

    const login = async (loginDto: LoginDto): Promise<{ success: boolean; status?: string; message?: string }> => {
        setIsLoading(true);
        try {
            const response = await authApi.login(loginDto);
            
            // Handle successful login with tokens
            if (response.success && response.accessToken) {
                handleAuthResponse(
                    response.accessToken,
                    response.refreshToken,
                    response.user
                );
                return { success: true };
            }
            
            // Handle pending approval
            if (response.status === 'pending') {
                // For pending users, we might still store some basic info
                setUser(response.user);
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                return { 
                    success: false, 
                    status: 'pending', 
                    message: response.message 
                };
            }
            
            // Handle other cases
            return { 
                success: false, 
                message: response.message || 'Login failed' 
            };
            
        } catch (error: any) {
            console.error('Login failed', error);
            throw error; // Let the component handle the specific error message
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (registerDto: RegisterDto) => {
        setIsLoading(true);
        try {
            console.log('🔐 AuthContext: Starting registration with data:', registerDto);
            const response = await authApi.register(registerDto);
            console.log('🔐 AuthContext: Registration response:', response);
            
            // Handle successful registration
            if (response.data && response.data.accessToken) {
                console.log('🔐 AuthContext: Registration successful with tokens');
                handleAuthResponse(
                    response.data.accessToken,
                    response.data.refreshToken,
                    response.data.user
                );
            } else {
                // Registration successful but pending approval
                console.log('🔐 AuthContext: Registration successful but pending approval');
                if (response.data && response.data.user) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            }
        } catch (error) {
            console.error('🔐 AuthContext: Registration failed', error);
            throw error; // Let the component handle the specific error message
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user && !!token,
                isLoading,
                login,
                register,
                logout,
                updateUser
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