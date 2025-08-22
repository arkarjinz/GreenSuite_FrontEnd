"use client"
import { ReactNode } from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-white relative overflow-hidden flex items-center justify-center">
            {/* Floating Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Large floating shapes */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-100/60 rounded-full blur-xl animate-float"></div>
                <div className="absolute top-20 right-20 w-24 h-24 bg-green-100/50 rounded-full blur-lg animate-float-delayed"></div>
                <div className="absolute bottom-20 left-20 w-28 h-28 bg-teal-100/40 rounded-full blur-xl animate-float-slow"></div>
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-lg animate-float"></div>
                
                {/* Medium decorative circles */}
                <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-green-200/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-emerald-300/20 rounded-full animate-bounce-slow"></div>
                
                {/* Small accent dots */}
                <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-emerald-400/60 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-green-500/50 rounded-full animate-bounce"></div>
                <div className="absolute top-2/3 right-1/5 w-4 h-4 bg-teal-400/40 rounded-full animate-pulse"></div>
                
                {/* Geometric shapes */}
                <div className="absolute top-1/5 left-1/5 w-8 h-8 border-2 border-emerald-300/30 rotate-45 animate-spin-slow"></div>
                <div className="absolute bottom-1/5 right-1/5 w-6 h-6 border border-green-400/40 rounded-lg rotate-12 animate-pulse"></div>
                
                {/* Gradient orbs */}
                <div className="absolute top-1/2 left-1/6 w-20 h-20 bg-gradient-to-br from-emerald-200/20 to-green-300/10 rounded-full blur-2xl animate-float-delayed"></div>
                <div className="absolute top-1/6 right-1/2 w-16 h-16 bg-gradient-to-tr from-teal-200/15 to-emerald-200/20 rounded-full blur-xl animate-float-slow"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-sm mx-auto p-4">
                {/* Clean Card with Subtle Effects */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 p-4 md:p-6 relative ">
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-green-50/20 rounded-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                        {children}
                    </div>
                    
                    {/* Corner accent elements */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-100/30 to-transparent rounded-tr-3xl"></div>
                </div>
                
                {/* Floating elements around card */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-200/50 rounded-full blur-sm animate-bounce-slow"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-green-300/40 rounded-full blur-sm animate-pulse"></div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(15px, -10px) rotate(2deg); }
                    66% { transform: translate(-8px, 12px) rotate(-1deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    50% { transform: translate(-10px, -15px) rotate(3deg) scale(1.05); }
                }
                
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -25px); }
                }
                
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                    animation-delay: 1.5s;
                }
                
                .animate-float-slow {
                    animation: float-slow 10s ease-in-out infinite;
                    animation-delay: 3s;
                }
                
                .animate-spin-slow {
                    animation: spin-slow 15s linear infinite;
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}