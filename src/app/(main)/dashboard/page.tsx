"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChartToggle from '@/components/Charts/Charts';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && user.approvalStatus === 'PENDING') {
            router.push('/pending');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.approvalStatus === 'PENDING') {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="p-2">
            <div className='p-8 grid md:grid-cols-3 grid-cols-1 gap-4 bg-gray-100'
            style={{
      background: "radial-gradient(circle,rgba(87, 199, 133, 1) 0%, rgba(255, 255, 255, 1) 100%)"
    }}>
                <ChartToggle />
            </div>
        </div>
    );
}