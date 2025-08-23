"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { 
    UsersIcon, 
    BuildingOfficeIcon, 
    ShieldExclamationIcon,
    ChartBarIcon,
    CogIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id && user?.globalAdmin) {
            loadAdminStats();
        }
    }, [user]);

    const loadAdminStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load various admin statistics
            const [users, companies, banStats] = await Promise.all([
                adminApi.getAllUsers(),
                adminApi.getAllCompanies(),
                adminApi.getBanStatistics()
            ]);

            setStats({
                totalUsers: users?.length || 0,
                totalCompanies: companies?.length || 0,
                banStats: banStats || {}
            });

        } catch (err: any) {
            console.error('Error loading admin stats:', err);
            setError(err.message || 'Failed to load admin statistics');
        } finally {
            setLoading(false);
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
                            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
                            onClick={loadAdminStats}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Administrator Dashboard</h1>
                    <p className="text-gray-600">Manage the entire GreenSuite platform</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Total Users</h2>
                            <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {stats?.totalUsers || 0}
                        </div>
                        <p className="text-gray-600">Registered users across all companies</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Total Companies</h2>
                            <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {stats?.totalCompanies || 0}
                        </div>
                        <p className="text-gray-600">Registered companies</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Banned Users</h2>
                            <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {stats?.banStats?.totalBanned || 0}
                        </div>
                        <p className="text-gray-600">Users currently banned</p>
                    </div>
                </div>

                {/* Admin Functions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Management */}
                    <Link href="/dashboard/admin/users" className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-blue-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                                <UsersIcon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-gray-600 mb-4">Manage all users, view profiles, and handle user operations</p>
                            <div className="text-blue-600 font-medium">Manage Users →</div>
                        </div>
                    </Link>

                    {/* Company Management */}
                    <Link href="/dashboard/admin/companies" className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-green-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Company Management</h2>
                                <BuildingOfficeIcon className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-gray-600 mb-4">Manage companies, view company details, and handle company operations</p>
                            <div className="text-green-600 font-medium">Manage Companies →</div>
                        </div>
                    </Link>

                    {/* Refill System */}
                    <Link href="/dashboard/admin/refill" className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-purple-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Refill System</h2>
                                <ClockIcon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-gray-600 mb-4">Manage credit refill system, view statistics, and trigger manual refills</p>
                            <div className="text-purple-600 font-medium">Manage Refills →</div>
                        </div>
                    </Link>

                    {/* Ban Management */}
                    <Link href="/dashboard/admin/bans" className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-red-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Ban Management</h2>
                                <ShieldExclamationIcon className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-gray-600 mb-4">Manage user bans, view ban statistics, and handle user restrictions</p>
                            <div className="text-red-600 font-medium">Manage Bans →</div>
                        </div>
                    </Link>

                    {/* Admin Management */}
                    <Link href="/dashboard/admin/admins" className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-orange-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Admin Management</h2>
                                <CogIcon className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-gray-600 mb-4">Manage global administrators, create new admins, and handle admin operations</p>
                            <div className="text-orange-600 font-medium">Manage Admins →</div>
                        </div>
                    </Link>

                    {/* Analytics */}
                    <Link href="/dashboard/admin/analytics" className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-indigo-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
                                <ChartBarIcon className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <p className="text-gray-600 mb-4">View platform analytics, system statistics, and performance metrics</p>
                            <div className="text-indigo-600 font-medium">View Analytics →</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
} 