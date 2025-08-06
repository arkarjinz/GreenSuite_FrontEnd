"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ownerApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { AuthUser } from '@/types/auth';

interface RejectedUser extends AuthUser {
    rejectionCount: number;
    remainingAttempts: number;
    approachingBan: boolean;
    isBanned: boolean;
    rejectionHistory?: Array<{
        companyName: string;
        rejectedAt: string;
        rejectionNumber: number;
        rejectedBy: string;
    }>;
}

interface CompanyStats {
    pendingUsers: number;
    approvedUsers: number;
    rejectedUsers: number;
    reapplicants: number;
    usersApproachingBan: number;
}

export default function RejectedUsersManager() {
    const { user } = useAuth();
    const [rejectedUsers, setRejectedUsers] = useState<RejectedUser[]>([]);
    const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState<RejectedUser | null>(null);
    const [showRejectionHistory, setShowRejectionHistory] = useState(false);
    const [rejectionHistory, setRejectionHistory] = useState<any[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (user?.companyRole === 'OWNER') {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Get company stats
            const stats = await ownerApi.getCompanyStats();
            setCompanyStats(stats);
            
            // Try to get rejected users (currently not directly available in backend)
            try {
                const rejected = await ownerApi.getRejectedUsers();
                setRejectedUsers(rejected);
            } catch (rejectedError: any) {
                // Handle the case where rejected users endpoint doesn't exist
                setError(rejectedError.message || 'Rejected users data is not currently available through the API. Check your pending users for any reapplicants.');
                setRejectedUsers([]);
            }
            
        } catch (err: any) {
            setError('Failed to load data: ' + (err.message || 'Unknown error'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const viewRejectionHistory = async (user: RejectedUser) => {
        try {
            setActionLoading(true);
            const history = await ownerApi.getUserRejectionHistory(user.id);
            setRejectionHistory(history);
            setSelectedUser(user);
            setShowRejectionHistory(true);
        } catch (err) {
            setError('Failed to load rejection history');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const reapproveUser = async (user: RejectedUser) => {
        try {
            setActionLoading(true);
            await ownerApi.approveUser(user.id);
            setRejectedUsers(prev => prev.filter(u => u.id !== user.id));
            setError('');
        } catch (err) {
            setError('Failed to re-approve user');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const getRejectionStatusColor = (user: RejectedUser) => {
        if (user.isBanned) return 'bg-red-100 text-red-800';
        if (user.approachingBan) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getRejectionStatusText = (user: RejectedUser) => {
        if (user.isBanned) return 'Permanently Banned';
        if (user.approachingBan) return 'Approaching Ban';
        return `${user.rejectionCount} Rejection${user.rejectionCount > 1 ? 's' : ''}`;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Rejected Users Management</h1>
                <p className="text-gray-600 mt-1">View and manage users who have been rejected from your company</p>
            </div>

            {/* Company Stats */}
            {companyStats && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{companyStats.pendingUsers}</div>
                        <div className="text-sm text-blue-600">Pending Users</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{companyStats.approvedUsers}</div>
                        <div className="text-sm text-green-600">Approved Users</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600">{companyStats.rejectedUsers}</div>
                        <div className="text-sm text-red-600">Rejected Users</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">{companyStats.reapplicants}</div>
                        <div className="text-sm text-yellow-600">Reapplicants</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">{companyStats.usersApproachingBan}</div>
                        <div className="text-sm text-orange-600">Approaching Ban</div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                    <div className="font-medium">Notice</div>
                    <div className="mt-1">{error}</div>
                    {error.includes('not currently available') && (
                        <div className="mt-2 text-sm">
                            <strong>Workaround:</strong> Check your pending users list for any users with rejection counts - these are reapplicants.
                        </div>
                    )}
                </div>
            )}

            {rejectedUsers.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rejected Users</h3>
                    <p className="text-gray-600">
                        {error.includes('not currently available') 
                            ? 'Rejected users data is not available through the current API. Check your pending users for reapplicants.'
                            : 'There are no rejected users at this time.'
                        }
                    </p>
                    {companyStats && companyStats.rejectedUsers > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-700">
                                The company statistics show {companyStats.rejectedUsers} rejected users, but the detailed list is not available through the current API endpoint. 
                                Backend development needed: <code>GET /api/owner/rejected-users</code>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {rejectedUsers.map((user) => (
                        <div key={user.id} className="bg-white border rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <p className="text-xs text-gray-400">@{user.userName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRejectionStatusColor(user)}`}>
                                            {getRejectionStatusText(user)}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {user.remainingAttempts} attempts remaining
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => viewRejectionHistory(user)}
                                            disabled={actionLoading}
                                        >
                                            History
                                        </Button>
                                        {!user.isBanned && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => reapproveUser(user)}
                                                disabled={actionLoading}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Re-approve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Warning/Ban Notices */}
                            {user.isBanned && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <div className="text-sm text-red-800">
                                        <strong>Permanently Banned:</strong> This user has been banned after 5 rejections and cannot reapply.
                                    </div>
                                </div>
                            )}

                            {user.approachingBan && !user.isBanned && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <div className="text-sm text-yellow-800">
                                        <strong>Warning:</strong> This user is approaching the ban limit. One more rejection will result in a permanent ban.
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection History Modal */}
            {showRejectionHistory && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-2xl max-w-2xl shadow-lg rounded-2xl bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Rejection History - {selectedUser.firstName} {selectedUser.lastName}
                            </h3>
                            <div className="max-h-96 overflow-y-auto">
                                {rejectionHistory.length === 0 ? (
                                    <p className="text-gray-500">No rejection history available.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {rejectionHistory.map((record, index) => (
                                            <div key={index} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            Rejection #{record.rejectionNumber}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Company: {record.companyName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Rejected by: {record.rejectedBy}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(record.rejectedAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectionHistory(false);
                                        setSelectedUser(null);
                                        setRejectionHistory([]);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 