"use client"
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Redirect if user is pending
    useEffect(() => {
        if (!isLoading && user && user.approvalStatus === 'PENDING') {
            router.push('/pending');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    if (!user || user.approvalStatus === 'PENDING') {
        // This will be redirected by useEffect
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Redirecting...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            {/* Your dashboard content here */}
        </div>
    );
}