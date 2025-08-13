"use client";

import React, { useState, useEffect } from 'react';
import { 
    CreditCardIcon, 
    BanknotesIcon, 
    PlusIcon, 
    MinusIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { paymentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AICreditPurchase from './AICreditPurchase';

interface PaymentAccount {
    accountNumber: string;
    userName: string;
    balance: number;
    creditPoints: number;
    status: string;
    createdDate: string;
}

interface DepositOptions {
    quickAmounts: {
        SMALL: { amount: number; currency: string; description: string };
        MEDIUM: { amount: number; currency: string; description: string };
        LARGE: { amount: number; currency: string; description: string };
    };
    paymentMethods: {
        CARD: { name: string; processingTime: string; fee: string; description: string };
        BANK_TRANSFER: { name: string; processingTime: string; fee: string; description: string };
        WALLET: { name: string; processingTime: string; fee: string; description: string };
    };
    limits: {
        minimumDeposit: number;
        maximumDeposit: number;
        dailyLimit: number;
        currency: string;
    };
}

export default function PaymentAccount() {
    const { user } = useAuth();
    const [paymentAccount, setPaymentAccount] = useState<PaymentAccount | null>(null);
    const [depositOptions, setDepositOptions] = useState<DepositOptions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(10);
    const [depositMethod, setDepositMethod] = useState<string>('CARD');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'account' | 'credits'>('account');
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
            
            // Load deposit options
            const optionsResponse = await paymentApi.getDepositOptions();
            if (optionsResponse.status === 'success') {
                setDepositOptions(optionsResponse.data);
            }

            // Try to load existing account first, then create new one if none exists
            await loadExistingAccount();
        } catch (error: any) {
            console.error('Error loading payment data:', error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadExistingAccount = async () => {
        try {
            if (!user?.id) {
                console.log('No user ID available, creating new account...');
                await createDemoAccount();
                return;
            }
            
            console.log('Attempting to load existing payment account for user:', user.id);
            
            // Try to get user's existing account
            const response = await paymentApi.getUserPaymentAccount(user.id);
            
            if (response.status === 'success' && response.data) {
                console.log('Found existing payment account:', response.data);
                setPaymentAccount(response.data);
                return; // Successfully loaded existing account
            }
            
            // If no existing account found, create a new one
            console.log('No existing account found, creating new one...');
            await createDemoAccount();
        } catch (error: any) {
            console.error('Error loading existing account:', error);
            // If loading fails, create a new account
            console.log('Failed to load existing account, creating new one...');
            await createDemoAccount();
        }
    };

    const createDemoAccount = async () => {
        try {
            setIsCreatingAccount(true);
            console.log('Creating payment account for user:', user?.id);
            const response = await paymentApi.createPaymentAccount(50.0); // Start with $50
            
            if (response.status === 'success') {
                console.log('Payment account created successfully:', response.data);
                setPaymentAccount(response.data);
                setSuccessMessage('Payment account created successfully!');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (error: any) {
            console.error('Error creating payment account:', error);
            setErrorMessage('Failed to create payment account: ' + error.message);
        } finally {
            setIsCreatingAccount(false);
        }
    };



    const handleQuickDeposit = async (amountType: 'SMALL' | 'MEDIUM' | 'LARGE') => {
        if (!paymentAccount) return;

        try {
            setIsDepositing(true);
            setErrorMessage('');
            
            const response = await paymentApi.quickDeposit(paymentAccount.accountNumber, amountType);
            
            if (response.status === 'success') {
                // Update the balance directly in state
                const depositedAmount = response.data?.amountDeposited || 
                    (amountType === 'SMALL' ? 10.00 : 
                     amountType === 'MEDIUM' ? 25.00 : 
                     amountType === 'LARGE' ? 50.00 : 10.00);
                
                if (paymentAccount) {
                    const newBalance = paymentAccount.balance + depositedAmount;
                    console.log(`Updating balance: ${paymentAccount.balance} + ${depositedAmount} = ${newBalance}`);
                    setPaymentAccount({
                        ...paymentAccount,
                        balance: newBalance
                    });
                }
                
                setSuccessMessage(`Successfully deposited $${depositedAmount} to your account!`);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (error: any) {
            console.error('Error processing quick deposit:', error);
            
            // Handle specific error cases
            let errorMsg = error.message || 'Failed to process deposit';
            
            if (error.message && error.message.includes('403')) {
                errorMsg = 'Access denied. You may not have permission to perform this action.';
            } else if (error.message && error.message.includes('404')) {
                errorMsg = 'Payment account not found. Please contact support.';
            } else if (error.message && error.message.includes('500')) {
                errorMsg = 'Server error. Please try again later or contact support.';
                console.error('Server error details:', error);
            }
            
            setErrorMessage(errorMsg);
        } finally {
            setIsDepositing(false);
        }
    };

    const handleCustomDeposit = async () => {
        if (!paymentAccount || depositAmount <= 0) return;

        try {
            setIsDepositing(true);
            setErrorMessage('');
            
            const response = await paymentApi.depositToAccount(paymentAccount.accountNumber, depositAmount);
            
            if (response.status === 'success') {
                // Update the balance directly in state
                if (paymentAccount) {
                    const newBalance = paymentAccount.balance + depositAmount;
                    console.log(`Updating balance: ${paymentAccount.balance} + ${depositAmount} = ${newBalance}`);
                    setPaymentAccount({
                        ...paymentAccount,
                        balance: newBalance
                    });
                }
                
                setSuccessMessage(`Successfully deposited $${depositAmount} to your account!`);
                setTimeout(() => setSuccessMessage(''), 5000);
                setShowDepositModal(false);
                setDepositAmount(10);
            }
        } catch (error: any) {
            console.error('Error processing custom deposit:', error);
            
            // Handle specific error cases
            let errorMsg = error.message || 'Failed to process deposit';
            
            if (error.message && error.message.includes('403')) {
                errorMsg = 'Access denied. You may not have permission to perform this action.';
            } else if (error.message && error.message.includes('404')) {
                errorMsg = 'Payment account not found. Please contact support.';
            } else if (error.message && error.message.includes('500')) {
                errorMsg = 'Server error. Please try again later or contact support.';
            }
            
            setErrorMessage(errorMsg);
        } finally {
            setIsDepositing(false);
        }
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
                    <p className="text-gray-600">Loading your payment account...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <CreditCardIcon className="w-12 h-12 text-green-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900">Payment Account</h1>
                    </div>
                    <p className="text-xl text-gray-600">
                        Manage your payment account and add funds for AI credit purchases
                    </p>
                </div>

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
                        </div>
                    </div>
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

                {/* Tab Content */}
                {activeTab === 'account' && (
                    <>

                {/* Account Information */}
                {paymentAccount && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
                                <button
                                    onClick={loadPaymentData}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Loading...' : 'Refresh'}
                                </button>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                paymentAccount.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {paymentAccount.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    ${paymentAccount.balance.toFixed(2)}
                                </div>
                                <p className="text-gray-600">Current Balance</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                    {paymentAccount.creditPoints}
                                </div>
                                <p className="text-gray-600">Credit Points</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-lg font-mono text-gray-600 mb-2">
                                    {paymentAccount.accountNumber}
                                </div>
                                <p className="text-gray-600">Account Number</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 text-center">
                            Account created: {new Date(paymentAccount.createdDate).toLocaleDateString()}
                        </div>
                    </div>
                )}

                {/* Quick Deposit Options */}
                {depositOptions && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Deposit</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {Object.entries(depositOptions.quickAmounts).map(([type, details]) => (
                                <button
                                    key={type}
                                    onClick={() => handleQuickDeposit(type as 'SMALL' | 'MEDIUM' | 'LARGE')}
                                    disabled={isDepositing || !paymentAccount}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl p-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="text-center">
                                        <div className="text-2xl font-bold mb-2">
                                            ${details.amount}
                                        </div>
                                        <div className="text-sm opacity-90 capitalize">
                                            {type.toLowerCase()} deposit
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Test simple deposit button */}
                        <div className="mt-4">
                            <button
                                onClick={() => handleCustomDeposit()}
                                disabled={isDepositing || !paymentAccount}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                            >
                                Test Simple Deposit ($10)
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                disabled={isDepositing || !paymentAccount}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-5 h-5 inline mr-2" />
                                Custom Amount
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Methods Info */}
                {depositOptions && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(depositOptions.paymentMethods).map(([method, details]) => (
                                <div key={method} className="border border-gray-200 rounded-xl p-6">
                                    <div className="flex items-center mb-4">
                                        <CreditCardIcon className="w-8 h-8 text-green-600 mr-3" />
                                        <h4 className="font-semibold text-gray-900">{details.name}</h4>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <ClockIcon className="w-4 h-4 mr-2" />
                                            {details.processingTime}
                                        </div>
                                        <div className="flex items-center">
                                            <BanknotesIcon className="w-4 h-4 mr-2" />
                                            Fee: {details.fee}
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 mt-3">
                                        {details.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2">Deposit Limits</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Minimum:</span>
                                    <div className="font-semibold">${depositOptions.limits.minimumDeposit}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Maximum:</span>
                                    <div className="font-semibold">${depositOptions.limits.maximumDeposit}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Daily Limit:</span>
                                    <div className="font-semibold">${depositOptions.limits.dailyLimit}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Currency:</span>
                                    <div className="font-semibold">{depositOptions.limits.currency}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Deposit Modal */}
                {showDepositModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Custom Deposit</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (USD)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        step="0.01"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        value={depositMethod}
                                        onChange={(e) => setDepositMethod(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="CARD">Credit/Debit Card</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="WALLET">Digital Wallet</option>
                                    </select>
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
                                    onClick={handleCustomDeposit}
                                    disabled={isDepositing || depositAmount <= 0}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDepositing ? 'Processing...' : 'Deposit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                    </>
                )}

                {/* AI Credits Tab */}
                {activeTab === 'credits' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">AI Credits</h2>
                            <button
                                onClick={loadPaymentData}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Loading...' : 'Refresh Data'}
                            </button>
                        </div>
                        <AICreditPurchase />
                    </div>
                )}
            </div>
        </div>
    );
} 