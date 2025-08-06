import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="space-y-6">
            {/* Compact Logo and branding */}
            <div className="text-center relative">
                <Link href="/" className="group inline-block">
                    <div className="relative">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                            GreenSuite
                        </h1>
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                </Link>
                
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-800">Welcome back</h2>
                    <p className="text-sm text-gray-600">Sign in to continue your journey</p>
                </div>
                
                {/* Minimal decorative elements */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-emerald-400/60 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce"></div>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Compact Social Login */}
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="group flex items-center justify-center px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-medium transition-all duration-200 hover:scale-105">
                        <div className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200">
                            <svg viewBox="0 0 24 24" className="w-full h-full">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </div>
                        Google
                    </button>
                    
                    <button className="group flex items-center justify-center px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105">
                        <div className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </div>
                        GitHub
                    </button>
                </div>
            </div>

            {/* Compact Footer */}
            <div className="text-center">
                <div className="text-sm text-gray-600">
                    <span>Don't have an account? </span>
                    <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors relative group">
                        <span className="relative z-10">Sign up</span>
                        <div className="absolute inset-0 bg-emerald-100/50 rounded scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                    </Link>
                </div>
            </div>
        </div>
    );
}