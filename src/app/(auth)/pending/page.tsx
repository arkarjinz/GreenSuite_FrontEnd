"use client"
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { companyApi } from '@/lib/api';
import { Company } from '@/types/company'; // Import Company type

export default function PendingPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [companyName, setCompanyName] = useState<string | null>(null);

    // Fetch company name when user is available
    useEffect(() => {
        if (user?.companyId) {
            const fetchCompanyName = async () => {
                try {
                    // Type-safe call with non-null assertion
                    const company: Company = await companyApi.getCompanyById(user.companyId!);
                    setCompanyName(company.name); // Set just the name
                } catch (error) {
                    console.error('Failed to fetch company name', error);
                    setCompanyName(null);
                }
            };
            fetchCompanyName();
        }
    }, [user]);

    // Redirect if user is not pending
    useEffect(() => {
        if (!isLoading && user && user.approvalStatus !== 'PENDING') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    return (
        <>
            {isLoading ? (
                <LoadingSpinner />
            ) : user && user.approvalStatus === 'PENDING' ? (
                <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="mb-6">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Account Pending Approval
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {companyName
                            ? `Your account is waiting for approval from the administrator at ${companyName}.`
                            : "Your account is waiting for approval from your company administrator."}
                        You&#39;ll be notified via email once your account has been activated.
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
                            onClick={() => router.refresh()}
                            className="w-full"
                        >
                            Check Approval Status
                        </Button>
                    </div>
                </div>
            ) : (
                <LoadingSpinner />
            )}
        </>
    );
}


