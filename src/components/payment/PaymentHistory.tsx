"use client";

import React, { useState, useEffect } from 'react';
import { 
    ClockIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    ExclamationTriangleIcon,
    CreditCardIcon,
    BanknotesIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentTransaction {
    transactionId: string;
    accountNumber: string;
    status: string;
    amount: number;
    paymentMethod: string;
    transactionReference: string;
    creditsPurchased?: number;
    creditPackage?: string;
    createdDate: string;
}

export default function PaymentHistory() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    useEffect(() => {
        if (user?.id) {
            loadPaymentHistory();
        }
    }, [user?.id]);

    const loadPaymentHistory = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            
            // Use a demo account number for now
            const demoAccountNumber = 'GreenSuite' + Math.floor(Math.random() * 90000) + 10000;
            
            const response = await paymentApi.getPaymentHistory(demoAccountNumber);
            
            if (response.status === 'success') {
                setTransactions(response.data.transactions || []);
            } else {
                setErrorMessage(response.message || 'Failed to load payment history');
            }
        } catch (error: any) {
            console.error('Error loading payment history:', error);
            setErrorMessage(error.message || 'Failed to load payment history');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'FAILED':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'PENDING':
                return <ClockIcon className="w-5 h-5 text-yellow-500" />;
            default:
                return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'CARD':
                return <CreditCardIcon className="w-4 h-4" />;
            case 'BANK_TRANSFER':
                return <BanknotesIcon className="w-4 h-4" />;
            case 'WALLET':
                return <ShoppingBagIcon className="w-4 h-4" />;
            default:
                return <CreditCardIcon className="w-4 h-4" />;
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (selectedStatus === 'ALL') return true;
        return transaction.status === selectedStatus;
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to view your payment history.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment history...</p>
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
                        <ClockIcon className="w-12 h-12 text-green-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900">Payment History</h1>
                    </div>
                    <p className="text-xl text-gray-600">
                        View all your payment transactions and credit purchases
                    </p>
                </div>

                {/* Error Message */}
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

                {/* Filter Controls */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                        
                        <div className="flex space-x-2">
                            {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedStatus === status
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
                            <p className="text-gray-600">
                                {selectedStatus === 'ALL' 
                                    ? "You haven't made any transactions yet."
                                    : `No ${selectedStatus.toLowerCase()} transactions found.`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.transactionId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        {getPaymentMethodIcon(transaction.paymentMethod)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {transaction.transactionReference}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {transaction.transactionId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ${transaction.amount.toFixed(2)}
                                                </div>
                                                {transaction.creditsPurchased && (
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.creditsPurchased} credits
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getPaymentMethodIcon(transaction.paymentMethod)}
                                                    <span className="ml-2 text-sm text-gray-900 capitalize">
                                                        {transaction.paymentMethod.toLowerCase().replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getStatusIcon(transaction.status)}
                                                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.createdDate).toLocaleDateString()}
                                                <div className="text-xs text-gray-500">
                                                    {new Date(transaction.createdDate).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.creditPackage && (
                                                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        {transaction.creditPackage}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                                {transactions.filter(t => t.status === 'COMPLETED').length}
                            </div>
                            <p className="text-gray-600">Completed</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 mb-2">
                                {transactions.filter(t => t.status === 'FAILED').length}
                            </div>
                            <p className="text-gray-600">Failed</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 mb-2">
                                {transactions.filter(t => t.status === 'PENDING').length}
                            </div>
                            <p className="text-gray-600">Pending</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                ${transactions
                                    .filter(t => t.status === 'COMPLETED')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toFixed(2)
                                }
                            </div>
                            <p className="text-gray-600">Total Spent</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 