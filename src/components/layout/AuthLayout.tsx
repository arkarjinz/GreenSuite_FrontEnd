import React from 'react';
import Navbar from '@/components/layout/Navbar';
// import GreenSuiteLogo from '@/components/ui/GreenSuiteLogo';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
            <Navbar />
            <div className="pt-24 pb-16 px-4">
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            {/*<GreenSuiteLogo size="lg" />*/}
                            Logo
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        <p className="mt-2 text-gray-600">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;