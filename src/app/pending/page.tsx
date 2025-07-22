"use client"
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    // Redirect if user is not pending
    useEffect(() => {
        if (!isLoading && user && user.approvalStatus !== 'PENDING') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    if (!user || user.approvalStatus !== 'PENDING') {
        // This will be redirected by useEffect
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Redirecting...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <div className="mb-6">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Account Pending Approval
                </h1>

                <p className="text-gray-600 mb-6">
                    {user.companyName ? (
                        `Your account is waiting for approval from the administrator at ${user.companyName}.`
                    ) : (
                        "Your account is waiting for approval from your company administrator."
                    )}
                    You'll be notified via email once your account has been activated.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="primary"
                        onClick={() => logout()}
                        className="w-full"
                    >
                        Sign Out
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="w-full"
                    >
                        Check Approval Status
                    </Button>
                </div>
            </div>
        </div>
    );
}