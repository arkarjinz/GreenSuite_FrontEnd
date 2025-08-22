"use client";

import React, { useState, useEffect } from 'react';
import { 
    CreditCardIcon, 
    BanknotesIcon, 
    PlusIcon, 
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    ArrowUpIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { paymentApi, aiCreditsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AICreditPurchase from './AICreditPurchase';

interface PaymentAccount {
    id: number;
    userId: string;
    accountNumber: string;
    accountName: string;
    balance: number;
    currency: string;
    status: string;
    verificationLevel: string;
    dailyLimit: number;
    monthlyLimit: number;
    dailySpent: number;
    monthlySpent: number;
    createdDate: string;
    lastTransactionDate?: string;
    transactionCount: number;
    successfulTransactionCount: number;
    isFrozen: boolean;
}

interface CreditInfo {
    currentCredits: number;
    chatCost: number;
    canChat: boolean;
    possibleChats: number;
    isLowOnCredits: boolean;
}

interface TransactionHistory {
    transactionId: string;
    transactionType: string;
    amount: number;
        currency: string;
    status: string;
    description: string;
    createdDate: string;
    creditsPurchased?: number;
    riskLevel?: string;
}

export default function PaymentAccount() {
    const { user } = useAuth();
    const [paymentAccount, setPaymentAccount] = useState<PaymentAccount | null>(null);
    const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
    const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
    const [accountStats, setAccountStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(25);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'account' | 'credits' | 'transactions'>('account');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && user?.id) {
            loadPaymentData();
        }
    }, [isClient, user?.id]);

    const loadPaymentData = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');
            
            // Try to load existing account
            await loadExistingAccount();
            
            // Load credit information
            await loadCreditInfo();
            
            // Load transaction history if account exists
            if (paymentAccount) {
                await loadTransactionHistory();
                await loadAccountStatistics();
            }
            
        } catch (error: any) {
            console.error('Error loading payment data:', error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadExistingAccount = async () => {
        try {
            console.log('🏦 Loading payment account...');
            const response = await paymentApi.getUserPaymentAccount();
            
            if (response.success && response.data) {
                console.log('✅ Found existing payment account:', response.data);
                // The account data is nested in response.data.account
                setPaymentAccount(response.data.account);
                return;
            } else if (response.error === 'NO_ACCOUNT_FOUND') {
                // No account found, user needs to create one
                console.log('🆕 No payment account found - user needs to create one');
                setPaymentAccount(null);
                return;
            } else if (response.error === 'USER_NOT_APPROVED') {
                // User is not approved yet
                console.log('🚫 User not approved for payment features');
                setPaymentAccount(null);
                setErrorMessage(response.message || 'Your account must be approved before accessing payment features.');
                return;
            }
            
        } catch (error: any) {
            console.error('❌ Error loading payment account:', error);
            setPaymentAccount(null);
            
            // Handle specific error messages
            if (error.message.includes('approval') || error.message.includes('not approved')) {
                setErrorMessage('Your account must be approved before accessing payment features. Please contact your administrator.');
            } else {
                setErrorMessage(error.message || 'Failed to load payment account');
            }
        }
    };

    const loadCreditInfo = async () => {
        try {
            console.log('💰 Loading credit information...');
            const response = await aiCreditsApi.getCreditBalance();
            
            if (response.success && response.data) {
                setCreditInfo(response.data);
            }
        } catch (error: any) {
            console.error('❌ Error loading credit info:', error);
            // Non-critical, set defaults
            setCreditInfo({
                currentCredits: 0,
                chatCost: 2,
                canChat: false,
                possibleChats: 0,
                isLowOnCredits: true
            });
        }
    };

    const loadTransactionHistory = async () => {
        try {
            console.log('📜 Loading transaction history...');
            const response = await paymentApi.getTransactionHistory(0, 20);
            
            if (response.success && response.data) {
                setTransactions(response.data.transactions || []);
            }
        } catch (error: any) {
            console.error('❌ Error loading transaction history:', error);
            setTransactions([]);
        }
    };

    const loadAccountStatistics = async () => {
        try {
            console.log('📊 Loading account statistics...');
            const response = await paymentApi.getAccountStatistics();
            
            if (response.success && response.data) {
                setAccountStats(response.data);
            }
        } catch (error: any) {
            console.error('❌ Error loading account statistics:', error);
            setAccountStats(null);
        }
    };

    const createAccount = async () => {
        if (!user?.id) {
            setErrorMessage('User authentication required');
            return;
        }

        try {
            setIsCreatingAccount(true);
            setErrorMessage('');
            setSuccessMessage('');

            console.log('🏦 Creating payment account...');
            const accountName = `${user?.firstName || user?.email || 'User'}'s Payment Account`;
            const response = await paymentApi.createPaymentAccount({
                accountName: accountName,
                currency: 'USD'
            });

            if (response.success && response.data) {
                console.log('✅ Payment account created successfully:', response.data);
                // The account data is nested in response.data.account
                setPaymentAccount(response.data.account);
                setSuccessMessage(response.message || 'Payment account created successfully!');
                // Reload to get fresh data
                setTimeout(() => loadPaymentData(), 1000);
            } else if (response.error === 'ACCOUNT_EXISTS') {
                setSuccessMessage('Using your existing payment account');
                setTimeout(() => loadPaymentData(), 1000);
            } else {
                setErrorMessage(response.message || 'Failed to create payment account');
            }
        } catch (error: any) {
            console.error('❌ Error creating payment account:', error);
            setErrorMessage(error.message || 'Failed to create payment account. Please try again.');
        } finally {
            setIsCreatingAccount(false);
        }
    };

    const handleDeposit = async () => {
        if (!paymentAccount || depositAmount <= 0) return;

        try {
            setIsDepositing(true);
            setErrorMessage('');
            
            console.log('💵 Processing deposit...', { amount: depositAmount });
            const response = await paymentApi.deposit({
                amount: depositAmount,
                paymentMethod: 'CARD',
                description: `Account deposit of $${depositAmount}`
            });
            
            if (response.success && response.data) {
                console.log('✅ Deposit successful:', response.data);
                
                // Update account balance
                if (paymentAccount && response.data.transaction) {
                    setPaymentAccount(prev => prev ? {
                        ...prev,
                        balance: response.data.transaction.balanceAfter || prev.balance + depositAmount
                    } : null);
                }
                
                setSuccessMessage(`🎉 Successfully deposited $${depositAmount} to your account!`);
                setTimeout(() => setSuccessMessage(''), 5000);
                setShowDepositModal(false);
                setDepositAmount(25);
                
                // Reload data to get updated information
                await loadPaymentData();
            }
        } catch (error: any) {
            console.error('❌ Error processing deposit:', error);
            setErrorMessage(`Deposit failed: ${error.message}`);
        } finally {
            setIsDepositing(false);
        }
    };

    const handleQuickDeposit = async (amount: number) => {
        setDepositAmount(amount);
        setShowDepositModal(true);
    };

    if (!isClient || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to access your payment account.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-4">Loading your payment account...</p>
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
                        <h1 className="text-4xl font-bold text-gray-900">Payment Dashboard</h1>
                    </div>
                    <p className="text-xl text-gray-600">
                        Manage your payment account, add funds, and purchase AI credits
                    </p>
                </div>

                {/* Quick Stats */}
                {(paymentAccount || creditInfo) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {paymentAccount && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Account Balance</h3>
                                    <BanknotesIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">${paymentAccount.balance.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">{paymentAccount.currency}</p>
                            </div>
                        )}
                        
                        {creditInfo && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">AI Credits</h3>
                                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{creditInfo.currentCredits}</p>
                                <p className="text-sm text-gray-500">
                                    {creditInfo.possibleChats} conversations available
                                </p>
                            </div>
                        )}
                        
                        {paymentAccount && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-lg font-bold text-gray-900">{paymentAccount.status}</p>
                                <p className="text-sm text-gray-500">{paymentAccount.verificationLevel} Level</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                                    activeTab === 'account'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                Payment Account
                            </button>
                            <button
                                onClick={() => setActiveTab('credits')}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                                    activeTab === 'credits'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                AI Credits
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                                    activeTab === 'transactions'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                Transactions
                            </button>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Success!</h3>
                                <p className="text-green-100">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approval Required Warning */}
                {errorMessage && errorMessage.includes('approval') && (
                    <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <ClockIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Account Approval Required</h3>
                                <p className="text-amber-100 mb-2">{errorMessage}</p>
                                <p className="text-amber-100 text-sm">
                                    Your account is being reviewed by our team. You'll be notified once approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Error Messages */}
                {errorMessage && !errorMessage.includes('approval') && (
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

                {/* Tab Content */}
                {activeTab === 'account' && (
                    <div className="space-y-8">
                        {!paymentAccount ? (
                            // Create Account Section
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
                                <CreditCardIcon className="w-16 h-16 text-green-600 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your Payment Account</h2>
                                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                    You need a payment account to manage funds and purchase AI credits. 
                                    Creating an account is free and takes just a moment.
                                </p>
                                <button
                                    onClick={createAccount}
                                    disabled={isCreatingAccount}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreatingAccount ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner />
                                            <span className="ml-2">Creating Account...</span>
                                        </div>
                                    ) : (
                                        'Create Payment Account'
                                    )}
                                </button>
                            </div>
                        ) : (
                            // Account Management Section
                            <>
                                {/* Account Details */}
                                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
                                        <button
                                            onClick={loadPaymentData}
                                            disabled={isLoading}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Loading...' : 'Refresh'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Account Info */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Account Number</label>
                                                <p className="text-lg font-mono text-gray-900">{paymentAccount.accountNumber}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Account Name</label>
                                                <p className="text-lg text-gray-900">{paymentAccount.accountName}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Status</label>
                                                <div className="flex items-center mt-1">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                paymentAccount.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {paymentAccount.status}
                                                    </span>
                                                </div>
                            </div>
                        </div>

                                        {/* Balance & Limits */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Current Balance</label>
                                                <p className="text-3xl font-bold text-green-600">
                                    ${paymentAccount.balance.toFixed(2)}
                                                </p>
                                </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Daily Limit</label>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-900">
                                                        ${paymentAccount.dailySpent.toFixed(2)} / ${paymentAccount.dailyLimit.toFixed(2)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {((paymentAccount.dailySpent / paymentAccount.dailyLimit) * 100).toFixed(1)}%
                                                    </span>
                            </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full" 
                                                        style={{ width: `${Math.min((paymentAccount.dailySpent / paymentAccount.dailyLimit) * 100, 100)}%` }}
                                                    ></div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>

                                {/* Quick Deposit */}
                                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Funds</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        {[10, 25, 50, 100].map((amount) => (
                                <button
                                                key={amount}
                                                onClick={() => handleQuickDeposit(amount)}
                                                disabled={isDepositing}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl p-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="text-center">
                                                    <div className="text-2xl font-bold mb-2">${amount}</div>
                                                    <div className="text-sm opacity-90">Quick Deposit</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                            disabled={isDepositing}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-5 h-5 inline mr-2" />
                                Custom Amount
                            </button>
                        </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* AI Credits Tab */}
                {activeTab === 'credits' && (
                    <div>
                        <AICreditPurchase />
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                            <button
                                onClick={loadTransactionHistory}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                Refresh
                            </button>
                                    </div>
                                    
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No Transactions Yet</h3>
                                <p className="text-gray-600">Your transaction history will appear here once you make deposits or purchases.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.map((transaction) => (
                                    <div key={transaction.transactionId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    transaction.transactionType === 'DEPOSIT' ? 'bg-green-100' :
                                                    transaction.transactionType === 'CREDIT_PURCHASE' ? 'bg-blue-100' :
                                                    'bg-gray-100'
                                                }`}>
                                                    {transaction.transactionType === 'DEPOSIT' ? (
                                                        <ArrowUpIcon className="w-5 h-5 text-green-600" />
                                                    ) : transaction.transactionType === 'CREDIT_PURCHASE' ? (
                                                        <SparklesIcon className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <BanknotesIcon className="w-5 h-5 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(transaction.createdDate).toLocaleDateString()} • 
                                                        {transaction.transactionId}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold ${
                                                    transaction.transactionType === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'
                                                }`}>
                                                    {transaction.transactionType === 'DEPOSIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {transaction.status}
                                                    </span>
                                                    {transaction.creditsPurchased && (
                                                        <span className="text-xs text-blue-600">
                                                            +{transaction.creditsPurchased} credits
                                                        </span>
                                                    )}
                                                </div>
                                        </div>
                                        </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Custom Deposit Modal */}
                {showDepositModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Funds</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (USD)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10000"
                                        step="0.01"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium">Deposit Information</p>
                                            <p>Funds will be added to your account balance instantly and can be used to purchase AI credits.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4 mt-6">
                                <button
                                    onClick={() => setShowDepositModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeposit}
                                    disabled={isDepositing || depositAmount <= 0}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDepositing ? (
                                        <div className="flex items-center justify-center">
                                            <LoadingSpinner />
                                            <span className="ml-2">Processing...</span>
                                        </div>
                                    ) : (
                                        `Deposit $${depositAmount.toFixed(2)}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 