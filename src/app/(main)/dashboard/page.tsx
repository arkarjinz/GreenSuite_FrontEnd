"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChartToggle from '@/components/Charts/Charts';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Redirect if user is pending
    useEffect(() => {
        if (!isLoading && user && user.approvalStatus === 'PENDING') {
            router.push('/pending');
        }
    }, [user, isLoading, router]);

    // Don't render anything until we're on the client side
    if (!isClient) {
        return <LoadingSpinner fullScreen />;
    }

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user || user.approvalStatus === 'PENDING') {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="w-full h-screen" style={{
            background: "radial-gradient(circle, rgba(87, 199, 133, 1) 0%, rgba(255, 255, 255, 1) 100%)"
        }}>
            {/* Main Dashboard Content */}
            <div className="max-w-7xl mx-auto min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mt-0">
                        Welcome, {user.firstName || 'User'}!
                    </h1>
                    <p className="mt-2 text-gray-600">Manage your environmental sustainability initiatives</p>
                </div>

                {/* Charts Section - Full width */}
                <div className="w-full p-4 h-full grid md:grid-cols-3 grid-cols-1 gap-4">
                    <ChartToggle />
                </div>
            </div>
        </div>
    );
}