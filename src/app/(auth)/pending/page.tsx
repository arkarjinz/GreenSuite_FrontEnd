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

    // Redirect if user is not pending
    useEffect(() => {
        if (!isLoading && user && user.approvalStatus !== 'PENDING') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Helper function to determine status severity
    const getStatusSeverity = () => {
        if (user?.warning) return 'critical';
        if ((user?.rejectionCount ?? 0) > 0) return 'warning';
        return 'info';
    };

    const severity = getStatusSeverity();

    return (
        <>
            {isLoading ? (
                <LoadingSpinner />
            ) : user && user.approvalStatus === 'PENDING' ? (
                <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                            {/* Header with status icon */}
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
                                    severity === 'critical' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                                    severity === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                                    'bg-gradient-to-br from-blue-500 to-indigo-500'
                                }`}>
                                    <ClockIcon className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Account Pending Approval
                                </h1>
                                <p className="text-gray-600">
                                    Waiting for company administrator approval
                                </p>
                            </div>

                            {/* Main Status Message */}
                            <div className="mb-6">
                                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                                    severity === 'critical' ? 'bg-red-50 border-red-200' :
                                    severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-blue-50 border-blue-200'
                                }`}>
                                    {severity === 'critical' ? (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    ) : severity === 'warning' ? (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className={`font-medium mb-1 ${
                                            severity === 'critical' ? 'text-red-800' :
                                            severity === 'warning' ? 'text-yellow-800' :
                                            'text-blue-800'
                                        }`}>
                                            {user.warning ? 'Critical Warning' :
                                             (user.rejectionCount ?? 0) > 0 ? 'Reapplication Pending' :
                                             'Initial Application Pending'}
                                        </h3>
                                        <p className={`text-sm ${
                                            severity === 'critical' ? 'text-red-600' :
                                            severity === 'warning' ? 'text-yellow-600' :
                                            'text-blue-600'
                                        }`}>
                                            {user.warning || (
                                                companyName
                                                    ? `Your account is waiting for approval from the administrator at ${companyName}.`
                                                    : "Your account is waiting for approval from your company administrator."
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection History Display */}
                            {(user.rejectionCount ?? 0) > 0 && (
                                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
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
                                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
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
                            <div className="mb-6 space-y-3">
                                <div className="text-sm text-gray-600">
                                    You'll be notified via email once your account has been reviewed.
                                </div>
                                {(user.rejectionCount ?? 0) > 0 && (
                                    <div className="text-sm text-gray-600">
                                        <strong>Note:</strong> This is a reapplication after previous rejection(s). 
                                        Please ensure you meet all company requirements.
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
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

                            {/* Contact Information */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 text-center">
                                    Need help? Contact your company administrator or our support team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <LoadingSpinner />
            )}
        </>
    );
}


