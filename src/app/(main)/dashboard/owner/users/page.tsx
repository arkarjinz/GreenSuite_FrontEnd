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
                    setPendingUsers(users);
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
                prev.map(user => user.id === userId ? updatedUser : user)
            );
        } catch (err) {
            setError('Failed to approve user');
            console.error(err);
        }
    };

    const handleReject = async (userId: string) => {
        try {
            const updatedUser = await ownerApi.rejectUser(userId);
            setPendingUsers(prev =>
                prev.map(user => user.id === userId ? updatedUser : user)
            );
        } catch (err) {
            setError('Failed to reject user');
            console.error(err);
        }
    };

    if (isLoading || loadingUsers) {
        return <LoadingSpinner />;
    }

    if (!user || user.companyRole !== 'OWNER') {
        return null;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Pending User Approvals</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600">No pending user approvals at this time.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {pendingUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                        <div className="ml-4">
                                            <div className="font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                @{user.userName}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.companyRole}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleApprove(user.id)}
                                            disabled={user.approvalStatus === 'APPROVED'}
                                        >
                                            {user.approvalStatus === 'APPROVED' ? 'Approved' : 'Approve'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReject(user.id)}
                                            disabled={user.approvalStatus === 'REJECTED'}
                                        >
                                            {user.approvalStatus === 'REJECTED' ? 'Rejected' : 'Reject'}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}