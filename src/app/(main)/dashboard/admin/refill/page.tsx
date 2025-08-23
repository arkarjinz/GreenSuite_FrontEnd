"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { refillApi, adminApi } from '@/lib/api';
import { 
    ClockIcon, 
    ChartBarIcon, 
    UsersIcon, 
    ArrowPathIcon,
    PlayIcon,
    CogIcon
} from '@heroicons/react/24/outline';

export default function AdminRefillPage() {
    const { user } = useAuth();
    const [refillTiming, setRefillTiming] = useState<any>(null);
    const [refillAnalytics, setRefillAnalytics] = useState<any>(null);
    const [allUsersStatus, setAllUsersStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [manualRefillLoading, setManualRefillLoading] = useState(false);

    useEffect(() => {
        if (user?.id && user?.globalAdmin) {
            loadRefillData();
        }
    }, [user]);

    const loadRefillData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load refill timing configuration
            const timingResponse = await refillApi.getRefillTiming();
            if (timingResponse.success) {
                setRefillTiming(timingResponse.data);
            }

            // Load refill analytics
            const analyticsResponse = await refillApi.getRefillAnalytics();
            if (analyticsResponse.success) {
                setRefillAnalytics(analyticsResponse.data);
            }

            // Load all users refill status
            const statusResponse = await refillApi.getAllUsersRefillStatus();
            if (statusResponse.success) {
                setAllUsersStatus(statusResponse.data);
            }

        } catch (err: any) {
            console.error('Error loading refill data:', err);
            setError(err.message || 'Failed to load refill information');
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefill = async () => {
        if (!selectedUserId.trim()) {
            alert('Please enter a user ID');
            return;
        }

        try {
            setManualRefillLoading(true);
            const response = await adminApi.triggerManualRefill(selectedUserId);
            if (response.success) {
                alert(`Manual refill completed for user ${selectedUserId}`);
                setSelectedUserId('');
                loadRefillData(); // Refresh data
            }
        } catch (err: any) {
            alert(`Failed to trigger manual refill: ${err.message}`);
        } finally {
            setManualRefillLoading(false);
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
                            <p className="mt-4 text-gray-600">Loading refill system information...</p>
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
                            onClick={loadRefillData}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Refill System Administration</h1>
                    <p className="text-gray-600">Manage the automatic credit refill system for the entire platform</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Refill Configuration */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
                            <CogIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        {refillTiming && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {refillTiming.interval}
                                        </div>
                                        <p className="text-sm text-gray-600">Refill Interval</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {refillTiming.amount}
                                        </div>
                                        <p className="text-sm text-gray-600">Credits per Refill</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {refillTiming.maxCredits}
                                        </div>
                                        <p className="text-sm text-gray-600">Max Credits</p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className={`text-2xl font-bold ${refillTiming.enabled ? 'text-green-600' : 'text-red-600'}`}>
                                            {refillTiming.enabled ? 'Active' : 'Inactive'}
                                        </div>
                                        <p className="text-sm text-gray-600">System Status</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-gray-700 text-sm">
                                        {refillTiming.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* System Analytics */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">System Analytics</h2>
                            <ChartBarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        
                        {refillAnalytics && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {refillAnalytics.systemAnalytics?.totalUsers || 'N/A'}
                                        </div>
                                        <p className="text-sm text-gray-600">Total Users</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {refillAnalytics.systemAnalytics?.activeUsers || 'N/A'}
                                        </div>
                                        <p className="text-sm text-gray-600">Active Users</p>
                                    </div>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <p className="text-purple-800 text-sm">
                                        Last updated: {new Date(refillAnalytics.lastUpdated).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Refill Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Manual Refill</h2>
                        <UsersIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Manually trigger a credit refill for a specific user. This will add 1 credit to their account.
                        </p>
                        
                        <div className="flex items-center space-x-4">
                            <input
                                type="text"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                placeholder="Enter user ID"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleManualRefill}
                                disabled={manualRefillLoading || !selectedUserId.trim()}
                                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {manualRefillLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <PlayIcon className="w-5 h-5" />
                                )}
                                <span>{manualRefillLoading ? 'Processing...' : 'Trigger Refill'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                        <ClockIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    
                    {allUsersStatus && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {allUsersStatus.totalUsers === 'N/A' ? 'Not Available' : allUsersStatus.totalUsers}
                                    </div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    {allUsersStatus.totalUsers === 'N/A' && (
                                        <p className="text-xs text-gray-500 mt-1">Backend not implemented</p>
                                    )}
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {allUsersStatus.usersEligibleForRefill === 'N/A' ? 'Not Available' : allUsersStatus.usersEligibleForRefill}
                                    </div>
                                    <p className="text-sm text-gray-600">Eligible for Refill</p>
                                    {allUsersStatus.usersEligibleForRefill === 'N/A' && (
                                        <p className="text-xs text-gray-500 mt-1">Backend not implemented</p>
                                    )}
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {allUsersStatus.usersAtMaxCredits === 'N/A' ? 'Not Available' : allUsersStatus.usersAtMaxCredits}
                                    </div>
                                    <p className="text-sm text-gray-600">At Max Credits</p>
                                    {allUsersStatus.usersAtMaxCredits === 'N/A' && (
                                        <p className="text-xs text-gray-500 mt-1">Backend not implemented</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800 text-sm">
                                        Next system refill: {new Date(allUsersStatus.nextSystemRefill).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800 text-sm">
                                        System status: {allUsersStatus.refillEnabled ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={loadRefillData}
                        className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Refresh System Information</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 