"use client";

import React, { useState, useEffect } from 'react';
import { 
    CreditCardIcon, 
    PlusIcon, 
    UserIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface UserPaymentAccount {
    accountNumber: string;
    userName: string;
    balance: number;
    creditPoints: number;
    status: string;
    createdDate: string;
}

export default function AdminPaymentManager() {
    const { user } = useAuth();
    const [userAccounts, setUserAccounts] = useState<UserPaymentAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState<UserPaymentAccount | null>(null);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [fundAmount, setFundAmount] = useState<number>(10);
    const [fundReason, setFundReason] = useState<string>('');
    const [isAddingFunds, setIsAddingFunds] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (user?.id && (user?.companyRole === 'OWNER' || user?.companyRole === 'MANAGER')) {
            loadUserAccounts();
        }
    }, [user?.id, user?.companyRole]);

    const loadUserAccounts = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            
            // Try to get real user accounts from API
            try {
                const response = await paymentApi.getAllUserPaymentAccounts();
                if (response.status === 'success' && response.data) {
                    setUserAccounts(response.data);
                    return;
                }
            } catch (error) {
                console.log('API not available, using demo data');
            }
            
            // Fallback to demo data if API is not available
            const demoAccounts: UserPaymentAccount[] = [
                {
                    accountNumber: 'GreenSuite12345',
                    userName: 'John Doe',
                    balance: 125.50,
                    creditPoints: 150,
                    status: 'ACTIVE',
                    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    accountNumber: 'GreenSuite23456',
                    userName: 'Jane Smith',
                    balance: 75.25,
                    creditPoints: 50,
                    status: 'ACTIVE',
                    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    accountNumber: 'GreenSuite34567',
                    userName: 'Bob Johnson',
                    balance: 0.00,
                    creditPoints: 0,
                    status: 'INACTIVE',
                    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    accountNumber: 'GreenSuite45678',
                    userName: 'Alice Brown',
                    balance: 250.00,
                    creditPoints: 350,
                    status: 'ACTIVE',
                    createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            
            setUserAccounts(demoAccounts);
        } catch (error: any) {
            console.error('Error loading user accounts:', error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFunds = async () => {
        if (!selectedAccount || fundAmount <= 0) return;

        try {
            setIsAddingFunds(true);
            setErrorMessage('');
            
            const response = await paymentApi.adminAddFunds(
                selectedAccount.accountNumber, 
                fundAmount, 
                fundReason || 'Admin addition'
            );
            
            if (response.status === 'success') {
                // Update local state
                setUserAccounts(prev => prev.map(account => 
                    account.accountNumber === selectedAccount.accountNumber
                        ? { ...account, balance: response.data.newBalance }
                        : account
                ));
                
                setSuccessMessage(`Successfully added $${fundAmount} to ${selectedAccount.userName}'s account!`);
                setTimeout(() => setSuccessMessage(''), 5000);
                setShowAddFundsModal(false);
                setSelectedAccount(null);
                setFundAmount(10);
                setFundReason('');
            }
        } catch (error: any) {
            console.error('Error adding funds:', error);
            setErrorMessage(error.message);
        } finally {
            setIsAddingFunds(false);
        }
    };

    const filteredAccounts = userAccounts.filter(account =>
        account.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || (user.companyRole !== 'OWNER' && user.companyRole !== 'MANAGER')) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading user payment accounts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <CreditCardIcon className="w-12 h-12 text-green-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900">Admin Payment Manager</h1>
                    </div>
                    <p className="text-xl text-gray-600">
                        Manage user payment accounts and add funds
                    </p>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Success! 🎉</h3>
                                <p className="text-green-100">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Error</h3>
                                <p className="text-red-100">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Stats */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by user name or account number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {userAccounts.length}
                                </div>
                                <div className="text-sm text-gray-600">Total Accounts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    ${userAccounts.reduce((sum, account) => sum + account.balance, 0).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600">Total Balance</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Accounts Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Account Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Credits
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAccounts.map((account) => (
                                    <tr key={account.accountNumber} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {account.userName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900">
                                                {account.accountNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                ${account.balance.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {account.creditPoints}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                account.status === 'ACTIVE' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(account.createdDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setShowAddFundsModal(true);
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs transition-colors flex items-center space-x-1"
                                            >
                                                <PlusIcon className="w-3 h-3" />
                                                <span>Add Funds</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredAccounts.length === 0 && (
                        <div className="p-12 text-center">
                            <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Accounts Found</h3>
                            <p className="text-gray-600">
                                {searchTerm ? 'No accounts match your search criteria.' : 'No user payment accounts found.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Add Funds Modal */}
                {showAddFundsModal && selectedAccount && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Funds</h3>
                            
                            <div className="mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">Account Details:</h4>
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <div><strong>User:</strong> {selectedAccount.userName}</div>
                                        <div><strong>Account:</strong> {selectedAccount.accountNumber}</div>
                                        <div><strong>Current Balance:</strong> ${selectedAccount.balance.toFixed(2)}</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount to Add (USD)
                                        </label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={fundAmount}
                                            onChange={(e) => setFundAmount(parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={fundReason}
                                            onChange={(e) => setFundReason(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="e.g., Bonus, Refund, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setShowAddFundsModal(false);
                                        setSelectedAccount(null);
                                        setFundAmount(10);
                                        setFundReason('');
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddFunds}
                                    disabled={isAddingFunds || fundAmount <= 0}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isAddingFunds ? 'Adding...' : 'Add Funds'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 