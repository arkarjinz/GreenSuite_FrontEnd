"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { 
    ShieldExclamationIcon, 
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AdminBansPage() {
    const { user } = useAuth();
    const [bannedUsers, setBannedUsers] = useState<any[]>([]);
    const [usersApproachingBan, setUsersApproachingBan] = useState<any[]>([]);
    const [banStats, setBanStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id && user?.globalAdmin) {
            loadBanData();
        }
    }, [user]);

    const loadBanData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [banned, approaching, stats] = await Promise.all([
                adminApi.getBannedUsers(),
                adminApi.getUsersApproachingBan(),
                adminApi.getBanStatistics()
            ]);
            
            setBannedUsers(banned || []);
            setUsersApproachingBan(approaching || []);
            setBanStats(stats || {});
        } catch (err: any) {
            console.error('Error loading ban data:', err);
            setError(err.message || 'Failed to load ban data');
        } finally {
            setLoading(false);
        }
    };

    const handleUnbanUser = async (userId: string) => {
        const reason = prompt('Enter reason for unbanning:') || 'No reason provided';
        
        try {
            await adminApi.unbanUser(userId, reason);
            alert('User unbanned successfully');
            loadBanData(); // Refresh the data
        } catch (err: any) {
            alert(`Failed to unban user: ${err.message}`);
        }
    };

    const handleBanUser = async (userId: string) => {
        const reason = prompt('Enter reason for banning:') || 'Manual ban by admin';
        
        try {
            await adminApi.banUser(userId, reason);
            alert('User banned successfully');
            loadBanData(); // Refresh the data
        } catch (err: any) {
            alert(`Failed to ban user: ${err.message}`);
        }
    };

    if (!user?.globalAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600">Access denied. Only global administrators can access this page.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading ban data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadBanData}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ban Management</h1>
                    <p className="text-gray-600">Manage user bans and restrictions across the platform</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Banned Users</h2>
                            <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {banStats?.totalBanned || 0}
                        </div>
                        <p className="text-gray-600">Currently banned users</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Approaching Ban</h2>
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                            {usersApproachingBan.length}
                        </div>
                        <p className="text-gray-600">Users close to being banned</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Total Bans</h2>
                            <ShieldExclamationIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-600 mb-2">
                            {banStats?.totalBans || 0}
                        </div>
                        <p className="text-gray-600">Total bans issued</p>
                    </div>
                </div>

                {/* Banned Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Banned Users ({bannedUsers.length})</h2>
                    </div>
                    
                    <div className="p-6">
                        {bannedUsers.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No users are currently banned.</p>
                        ) : (
                            <div className="space-y-4">
                                {bannedUsers.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <p className="text-xs text-red-600 mt-1">
                                                Banned: {user.banReason || 'No reason provided'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnbanUser(user.id)}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            <CheckIcon className="w-4 h-4 mr-1" />
                                            Unban
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Users Approaching Ban */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Users Approaching Ban ({usersApproachingBan.length})</h2>
                    </div>
                    
                    <div className="p-6">
                        {usersApproachingBan.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No users are approaching a ban.</p>
                        ) : (
                            <div className="space-y-4">
                                {usersApproachingBan.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <p className="text-xs text-yellow-600 mt-1">
                                                Warning: {user.warningReason || 'Multiple violations detected'}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleBanUser(user.id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <XMarkIcon className="w-4 h-4 mr-1" />
                                                Ban
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 