"use client"
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
        return <LoadingSpinner fullScreen />;
    }

    if (!user || user.approvalStatus === 'PENDING') {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-4">Welcome to your sustainability dashboard!</p>
            {/* Your dashboard content here */}
        </div>
    );
}