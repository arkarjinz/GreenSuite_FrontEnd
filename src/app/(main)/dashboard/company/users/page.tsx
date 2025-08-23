"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ownerApi } from '@/lib/api';
import { AuthUser } from '@/types/auth';

export default function CompanyUsersPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [companyUsers, setCompanyUsers] = useState<AuthUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Redirect if not authenticated or no company
    useEffect(() => {
        if (!isLoading && (!user || !user.companyId)) {
            console.warn('User does not have a company ID, redirecting to dashboard');
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Fetch company users
    useEffect(() => {
        if (user?.companyId) {
            console.log('Loading company users for company ID:', user.companyId);
            loadCompanyUsers();
        } else {
            console.warn('User does not have a company ID:', user);
            setError('User does not have a valid company ID');
        }
    }, [user]);

    const loadCompanyUsers = async () => {
        try {
            setLoadingUsers(true);
            setError('');
            
            // Debug: Check authentication status
            console.log('🔍 loadCompanyUsers - User from context:', user);
            console.log('🔍 loadCompanyUsers - User company ID:', user?.companyId);
            console.log('🔍 loadCompanyUsers - User role:', user?.companyRole);
            
            // Check if user has required role
            if (!user?.companyRole || !['OWNER', 'MANAGER', 'EMPLOYEE'].includes(user.companyRole)) {
                setError('You do not have permission to view company users. Required role: OWNER, MANAGER, or EMPLOYEE');
                return;
            }
            
            const users = await ownerApi.getCompanyUsers();
            // Ensure each user has a valid ID for React keys
            const usersWithValidIds = users.map((user, index) => ({
                ...user,
                id: user.id || `company-user-${index}`
            }));
            setCompanyUsers(usersWithValidIds);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch company users');
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'OWNER':
                return 'bg-purple-100 text-purple-800';
            case 'MANAGER':
                return 'bg-blue-100 text-blue-800';
            case 'EMPLOYEE':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isClient || isLoading || loadingUsers) {
        return <LoadingSpinner />;
    }

    if (!user || !user.companyId) {
        return null;
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Company Users</h1>
                <p className="text-gray-600 mt-1">View all users in your company</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
                    {error}
                    {error.includes('not associated with a company') && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-yellow-800 text-sm">
                                <strong>Solution:</strong> Your account needs to be associated with a company. 
                                Please contact your system administrator to set up your company association.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {companyUsers.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No company users found</h3>
                    <p className="text-gray-600">There are no users in your company at this time.</p>

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
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Active
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companyUsers.map((userItem, index) => (
                                <tr key={userItem.id || `company-user-${index}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
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
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userItem.companyRole)}`}>
                                            {userItem.companyRole}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(userItem.approvalStatus)}`}>
                                            {userItem.approvalStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {userItem.lastActive ? new Date(userItem.lastActive).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Company Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-gray-900">{companyUsers.length}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-purple-600">
                        {companyUsers.filter(u => u.companyRole === 'OWNER').length}
                    </div>
                    <div className="text-sm text-gray-600">Owners</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-blue-600">
                        {companyUsers.filter(u => u.companyRole === 'MANAGER').length}
                    </div>
                    <div className="text-sm text-gray-600">Managers</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="text-2xl font-bold text-green-600">
                        {companyUsers.filter(u => u.companyRole === 'EMPLOYEE').length}
                    </div>
                    <div className="text-sm text-gray-600">Employees</div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="mt-6 text-center">
                <button
                    onClick={loadCompanyUsers}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    Refresh List
                </button>
            </div>
        </div>
    );  
}