'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentApi } from '@/lib/api';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface CreditTransaction {
    id: string;
    type: string;
    typeDescription: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    conversationId?: string;
    timestamp: string;
}

interface CreditHistory {
    transactions: CreditTransaction[];
    totalTransactions: number;
    currentBalance: number;
}

export default function CreditTransactionHistory() {
    const { user } = useAuth();
    const [history, setHistory] = useState<CreditHistory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');

    useEffect(() => {
        if (user?.id) {
            loadCreditHistory();
        }
    }, [user?.id]);

    const loadCreditHistory = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            
            const response = await paymentApi.getCreditTransactionHistory(user!.id);
            if (response.status === 'success') {
                setHistory(response.data);
            } else {
                throw new Error(response.message || 'Failed to load credit history');
            }
        } catch (error: any) {
            console.error('Error loading credit history:', error);
            setErrorMessage(error.message || 'Failed to load credit history');
        } finally {
            setIsLoading(false);
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'CHAT_DEDUCTION':
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'CREDIT_PURCHASE':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'ADMIN_GRANT':
                return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
            case 'REFUND':
                return <CheckCircleIcon className="w-5 h-5 text-yellow-500" />;
            case 'AUTO_REFILL':
                return <ClockIcon className="w-5 h-5 text-purple-500" />;
            default:
                return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'CHAT_DEDUCTION':
                return 'text-red-600 bg-red-50';
            case 'CREDIT_PURCHASE':
                return 'text-green-600 bg-green-50';
            case 'ADMIN_GRANT':
                return 'text-blue-600 bg-blue-50';
            case 'REFUND':
                return 'text-yellow-600 bg-yellow-50';
            case 'AUTO_REFILL':
                return 'text-purple-600 bg-purple-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredTransactions = history?.transactions.filter(transaction => 
        selectedType === 'ALL' || transaction.type === selectedType
    ) || [];

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-gray-600">Loading credit history...</span>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading History</h3>
                    <p className="text-gray-600 mb-4">{errorMessage}</p>
                    <button
                        onClick={loadCreditHistory}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Credit Transaction History</h2>
                        <p className="text-gray-600 mt-1">
                            Track all your AI credit transactions and usage
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Current Balance</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {history?.currentBalance || 0} credits
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedType('ALL')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedType === 'ALL'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All Transactions ({history?.totalTransactions || 0})
                    </button>
                    <button
                        onClick={() => setSelectedType('CREDIT_PURCHASE')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedType === 'CREDIT_PURCHASE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Purchases
                    </button>
                    <button
                        onClick={() => setSelectedType('CHAT_DEDUCTION')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedType === 'CHAT_DEDUCTION'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Chat Usage
                    </button>
                    <button
                        onClick={() => setSelectedType('ADMIN_GRANT')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedType === 'ADMIN_GRANT'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Admin Grants
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="p-6">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Found</h3>
                        <p className="text-gray-600">
                            {selectedType === 'ALL' 
                                ? 'You haven\'t made any credit transactions yet.'
                                : `No ${selectedType.toLowerCase().replace('_', ' ')} transactions found.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-900">
                                                {transaction.typeDescription}
                                            </h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                                                {transaction.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {transaction.reason}
                                        </p>
                                        {transaction.conversationId && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Conversation: {transaction.conversationId}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(transaction.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Balance: {transaction.balanceAfter}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {history && history.transactions.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Total Transactions</p>
                            <p className="text-xl font-bold text-gray-900">{history.totalTransactions}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Credits Purchased</p>
                            <p className="text-xl font-bold text-green-600">
                                {history.transactions
                                    .filter(t => t.type === 'CREDIT_PURCHASE')
                                    .reduce((sum, t) => sum + Math.max(0, t.amount), 0)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Credits Used</p>
                            <p className="text-xl font-bold text-red-600">
                                {Math.abs(history.transactions
                                    .filter(t => t.type === 'CHAT_DEDUCTION')
                                    .reduce((sum, t) => sum + Math.min(0, t.amount), 0))}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Current Balance</p>
                            <p className="text-xl font-bold text-blue-600">{history.currentBalance}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 