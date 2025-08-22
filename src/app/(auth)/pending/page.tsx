"use client"
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { companyApi } from '@/lib/api';
import { Company } from '@/types/company';
import { ClockIcon, ExclamationTriangleIcon, InformationCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function PendingPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering to prevent hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Fetch company name when user is available
    useEffect(() => {
        if (user?.companyId) {
            const fetchCompanyName = async () => {
                try {
                    const company: Company = await companyApi.getCompanyById(user.companyId!);
                    setCompanyName(company.name);
                } catch (error) {
                    console.error('Failed to fetch company name', error);
                    setCompanyName(null);
                }
            };
            fetchCompanyName();
        }
    }, [user]);

    // Don't render anything until client-side hydration is complete
    if (!isClient || isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // If user is not pending, redirect to dashboard
    if (user && user.approvalStatus !== 'PENDING') {
            router.push('/dashboard');
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // If no user, show loading
    if (!user) {
    return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Status Card - Full width on mobile, centered on desktop */}
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 lg:p-8 animate-slide-up">
                            {/* Header with status icon */}
                            <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <ClockIcon className="w-8 h-8 text-white" />
                                </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    Account Pending Approval
                                </h1>
                        <p className="text-sm md:text-base text-gray-600">
                                    Waiting for company administrator approval
                                </p>
                            </div>

                            {/* Main Status Message */}
                            <div className="mb-6">
                        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 flex items-start space-x-3">
                                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                <h3 className="text-base font-semibold text-blue-800 mb-1">
                                            {user.warning ? 'Critical Warning' :
                                             (user.rejectionCount ?? 0) > 0 ? 'Reapplication Pending' :
                                             'Initial Application Pending'}
                                        </h3>
                                <p className="text-sm text-blue-600">
                                            {user.warning || (
                                                companyName
                                            ? (
                                                <>
                                                    Your account is waiting for approval from the administrator at{' '}
                                                    <button 
                                                        className="text-blue-700 underline cursor-pointer hover:text-blue-800 transition-colors font-medium"
                                                        onClick={() => {
                                                            // You can add company details modal or navigation here
                                                            console.log('Company clicked:', companyName);
                                                        }}
                                                    >
                                                        {companyName}
                                                    </button>.
                                                </>
                                            )
                                                    : "Your account is waiting for approval from your company administrator."
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection History Display */}
                            {(user.rejectionCount ?? 0) > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h3 className="text-gray-800 font-medium mb-3 flex items-center">
                                        <UserGroupIcon className="w-5 h-5 mr-2" />
                                        Application History
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Previous Rejections:</span>
                                            <span className="font-medium text-gray-900">{user.rejectionCount}</span>
                                        </div>
                                        {user.remainingAttempts !== undefined && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Attempts Remaining:</span>
                                                <span className={`font-medium ${
                                                    user.remainingAttempts <= 1 ? 'text-red-600' : 
                                                    user.remainingAttempts <= 2 ? 'text-yellow-600' : 
                                                    'text-green-600'
                                                }`}>
                                                    {user.remainingAttempts}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Critical Warning for Ban Risk */}
                            {user.warning && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-red-800 font-semibold mb-1">URGENT WARNING</h3>
                                            <p className="text-red-700 text-sm mb-2">{user.warning}</p>
                                            <p className="text-red-600 text-xs">
                                                If this application is rejected, your account will be permanently banned from the platform.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Information */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                                    You'll be notified via email once your account has been reviewed.
                        </p>
                                {(user.rejectionCount ?? 0) > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                        <strong>Note:</strong> This is a reapplication after previous rejection(s). 
                                        Please ensure you meet all company requirements.
                            </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                        <button
                                    onClick={() => logout()}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                                >
                                    Sign Out
                        </button>
                        <button
                                    onClick={() => router.refresh()}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Check Approval Status
                        </button>
                            </div>

                            {/* Contact Information */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    Need help? Contact your company administrator or our support team.
                                </p>
                            </div>
                        </div>
                </div>
        
    );
}
