import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="space-y-4">
            {/* Compact Logo and branding */}
            <div className="text-center relative">
                <Link href="/" className="group inline-block">
                    <div className="relative">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1 group-hover:scale-105 transition-transform duration-300">
                            GreenSuite
                        </h1>
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>
                </Link>
                
                <div className="space-y-0.5">
                    <h2 className="text-lg font-bold text-gray-800">Join the revolution</h2>
                    <p className="text-xs text-gray-600">Create your account and make a difference</p>
                </div>
                
                {/* Minimal decorative elements */}
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-green-400/60 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-1 h-1 bg-emerald-500/50 rounded-full animate-bounce"></div>
            </div>

            {/* Register Form */}
            <RegisterForm />

            {/* Compact Footer */}
            <div className="text-center">
                <div className="text-xs text-gray-600">
                    <span>Already have an account? </span>
                    <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors relative group">
                        <span className="relative z-10">Sign in</span>
                        <div className="absolute inset-0 bg-emerald-100/50 rounded scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

