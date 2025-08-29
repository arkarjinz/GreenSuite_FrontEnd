"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ownerApi } from '@/lib/api';
import { AuthUser } from '@/types/auth';
import Button from '@/components/ui/Button';

export default function OwnerUsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState<AuthUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Redirect if not owner
    useEffect(() => {
        if (!isLoading && user && user.companyRole !== 'OWNER') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Fetch pending users
    useEffect(() => {
        if (user?.companyRole === 'OWNER') {
            setLoadingUsers(true);
            setError('');
            ownerApi.getPendingUsers()
                .then(users => {
                    // Ensure each user has a valid ID for React keys
                    const usersWithValidIds = users.map((user, index) => ({
                        ...user,
                        id: user.id || `user-${index}` // Fallback ID if missing
                    }));
                    setPendingUsers(usersWithValidIds);
                })
                .catch(err => {
                    setError('Failed to fetch pending users');
                    console.error(err);
                })
                .finally(() => setLoadingUsers(false));
        }
    }, [user]);

    const handleApprove = async (userId: string) => {
        try {
            const updatedUser = await ownerApi.approveUser(userId);
            setPendingUsers(prev =>
                prev.filter(user => user.id !== userId) // Remove approved user from pending list
            );
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Failed to approve user');
            console.error(err);
        }
    };

    const handleReject = async (userId: string) => {
        setSelectedUserId(userId);
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        try {
            const result = await ownerApi.rejectUser(selectedUserId, rejectReason);
            setPendingUsers(prev =>
                prev.filter(user => user.id !== selectedUserId) // Remove rejected user from pending list
            );
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedUserId('');
            setError(''); // Clear any previous errors
            
            // Show success message with rejection details
            if (result.isBanned) {
                setError(`User has been permanently banned after 5 rejections.`);
            } else if (result.warning) {
                setError(`User rejected. WARNING: This is their ${result.rejectionCount} rejection - one more will result in a permanent ban.`);
            } else {
                setError(`User rejected successfully. They have ${result.remainingAttempts} attempts remaining.`);
            }
        } catch (err) {
            setError('Failed to reject user');
            console.error(err);
        }
    };

    if (!isClient || isLoading || loadingUsers) {
        return <LoadingSpinner />;
    }

    if (!user || user.companyRole !== 'OWNER') {
        return null;
    }

    return (
        <div className="p-4 max-w-6xl mx-auto ">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Pending User Approvals</h1>
                <p className="text-gray-600 mt-1">Review and approve or reject users requesting access to your company</p>
            </div>

            {error && (
                <div className={`mb-4 p-3 rounded-md ${
                    error.includes('successfully') || error.includes('WARNING') 
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {error}
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                    <p className="text-gray-600">There are no users waiting for approval at this time.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rejection Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {pendingUsers.map((userItem, index) => (
                            <tr key={userItem.id || `pending-user-${index}`} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-medium text-gray-900">
                                                {userItem.firstName} {userItem.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                @{userItem.userName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {userItem.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                        {userItem.companyRole}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(userItem.rejectionCount ?? 0) > 0 ? (
                                        <div>
                                            <div className="text-red-600 font-medium">
                                                {userItem.rejectionCount ?? 0} rejection{(userItem.rejectionCount ?? 0) > 1 ? 's' : ''}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {userItem.remainingAttempts ?? 0} attempts left
                                            </div>
                                            {userItem.warning && (
                                                <div className="text-xs text-red-500 font-medium">
                                                    ⚠️ Approaching ban
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-green-600">First application</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleApprove(userItem.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReject(userItem.id)}
                                            className="border-red-300 text-red-700 hover:bg-red-50"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject User</h3>
                            <div className="mb-4">
                                <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    id="rejectReason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Please provide a reason for rejection..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectReason('');
                                        setSelectedUserId('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={confirmReject}
                                    disabled={!rejectReason.trim()}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Reject User
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}