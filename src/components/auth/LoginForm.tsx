"use client"
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon, InformationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginDto {
    email: string;
    password: string;
}

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formError, setFormError] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setPendingMessage('');

        try {
            const loginDto: LoginDto = {
                email: email,
                password: password
            };
            
            const result = await login(loginDto);
            
            if (result.success) {
                return;
            }
            
            if (result.status === 'pending') {
                setPendingMessage(result.message || 'Your account is pending approval');
                router.push('/pending');
                return;
            }
            
            if (result.status === 'rejected') {
                // Redirect to reapply page for rejected users
                router.push('/reapply');
                return;
            }
            
            setFormError(result.message || 'Login failed. Please try again.');
            
        } catch (error: any) {
            console.error('Login error:', error);
            setFormError(error.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="space-y-5">
            {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start">
                    <ExclamationCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{formError}</span>
                </div>
            )}

            {pendingMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm flex items-start">
                    <InformationCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{pendingMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    {/* Email Field */}
                    <div className="group">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.01]' : ''}`}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200"
                                placeholder="your@email.com"
                            />
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/10 to-green-400/10 pointer-events-none transition-opacity duration-200 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`}></div>
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="group">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.01]' : ''}`}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 pr-12 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-200"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 transition-all duration-200 hover:scale-110"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/10 to-green-400/10 pointer-events-none transition-opacity duration-200 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between text-sm">
                    <label className="group flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={() => setRememberMe(!rememberMe)}
                                className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${rememberMe 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'border-gray-300 group-hover:border-emerald-400'
                            }`}>
                                {rememberMe && (
                                    <svg className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="ml-2 text-gray-700 group-hover:text-emerald-600 transition-colors">Remember me</span>
                    </label>

                    <a href="/forgot-password" className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium">
                        Forgot password?
                    </a>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    
                    <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </>
                        )}
                    </span>
                </button>
            </form>
        </div>
    );
}