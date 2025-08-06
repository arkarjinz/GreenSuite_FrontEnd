"use client"
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function RejectedPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Redirect if user is not rejected or not authenticated
    useEffect(() => {
        if (!isLoading && user && user.approvalStatus !== 'REJECTED') {
            if (user.approvalStatus === 'PENDING') {
                router.push('/pending');
            } else if (user.approvalStatus === 'APPROVED') {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user || user.approvalStatus !== 'REJECTED') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Application Rejected
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    We're sorry, but your application for GreenSuite access has been rejected.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                What happens next?
                            </h3>
                            <p className="text-sm text-gray-600">
                                You can submit a new application with updated information. 
                                Please review your previous application and make any necessary changes.
                            </p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Application Review
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            Common reasons for rejection include:
                                        </p>
                                        <ul className="mt-2 list-disc list-inside space-y-1">
                                            <li>Incomplete or inaccurate information</li>
                                            <li>Invalid company details</li>
                                            <li>Inappropriate role description</li>
                                            <li>Duplicate applications</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full"
                                onClick={() => router.push('/reapply')}
                            >
                                Submit New Application
                                <ArrowRightIcon className="ml-2 w-4 h-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full"
                                onClick={() => router.push('/login')}
                            >
                                Back to Login
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-500">
                            <p>
                                Need help? Contact your company administrator or{' '}
                                <a href="mailto:support@greensuite.com" className="text-green-600 hover:text-green-500">
                                    contact support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 