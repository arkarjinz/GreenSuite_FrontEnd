'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CreditPackage {
    credits: number;
    price: number;
    currency: string;
    description: string;
    bonus?: string;
}

interface PricingData {
    chatCost: number;
    packages: {
        BASIC: CreditPackage;
        STANDARD: CreditPackage;
        PREMIUM: CreditPackage;
    };
    paymentMethods: {
        CARD: string;
        BANK_TRANSFER: string;
        WALLET: string;
    };
    features: {
        chatWithRin: string;
        environmentalTips: string;
        historyAccess: string;
        personalityAnalysis: string;
    };
}

export default function AICreditPurchase() {
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<'BASIC' | 'STANDARD' | 'PREMIUM' | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CARD' | 'BANK_TRANSFER' | 'WALLET'>('CARD');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCanceled, setShowCanceled] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [pricingData, setPricingData] = useState<PricingData | null>(null);
    const [paymentAccount, setPaymentAccount] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            
            // Load pricing data
            const pricingResponse = await paymentApi.getCreditPricing();
            if (pricingResponse.status === 'success') {
                setPricingData(pricingResponse.data);
            }

            // Load user's payment account
            try {
                const accountResponse = await paymentApi.getUserPaymentAccount(user?.id || '');
                if (accountResponse.status === 'success') {
                    setPaymentAccount(accountResponse.data);
                }
            } catch (error) {
                console.log('No payment account found, will create one during purchase');
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            setErrorMessage('Failed to load pricing information');
            setShowError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePackageSelect = (pkg: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
        setSelectedPackage(pkg);
    };

    const handlePurchase = async () => {
        if (!selectedPackage || !pricingData) return;

        setIsProcessing(true);
        setShowError(false);
        
        try {
            const pkg = pricingData.packages[selectedPackage];
            
            // If user doesn't have a payment account, create one first
            let accountNumber = paymentAccount?.accountNumber;
            if (!accountNumber) {
                const createAccountResponse = await paymentApi.createPaymentAccount(pkg.price);
                if (createAccountResponse.status === 'success') {
                    accountNumber = createAccountResponse.data.accountNumber;
                    setPaymentAccount(createAccountResponse.data);
                } else {
                    throw new Error('Failed to create payment account');
                }
            }

            // Purchase credits
            const purchaseRequest = {
                accountNumber: accountNumber,
                paymentMethod: selectedPaymentMethod,
                creditPackage: selectedPackage,
                creditAmount: pkg.credits,
                amount: pkg.price
            };

            const purchaseResponse = await paymentApi.purchaseCredits(purchaseRequest);
            
            if (purchaseResponse.status === 'success') {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                throw new Error(purchaseResponse.message || 'Purchase failed');
            }
        } catch (error: any) {
            console.error('Error purchasing credits:', error);
            setErrorMessage(error.message || 'Failed to purchase credits');
            setShowError(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setShowCanceled(true);
        setTimeout(() => setShowCanceled(false), 3000);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (!pricingData) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Failed to load pricing information</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Purchase AI Credits
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Choose the perfect credit package to chat with Rin, our AI environmental assistant. 
                        Each conversation costs {pricingData.chatCost} credits.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {Object.entries(pricingData.packages).map(([key, pkg]) => (
                        <div
                            key={key}
                            className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl ${
                                selectedPackage === key 
                                    ? 'border-green-500 shadow-green-100' 
                                    : 'border-gray-200 hover:border-green-300'
                            }`}
                        >
                            {pkg.bonus && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        {pkg.bonus}
                                    </span>
                                </div>
                            )}
                            
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {key.charAt(0) + key.slice(1).toLowerCase()}
                                </h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-green-600">
                                        ${pkg.price}
                                    </span>
                                    <span className="text-gray-500">/{pkg.currency}</span>
                                </div>
                                <p className="text-gray-600 mb-6">{pkg.description}</p>
                                
                                <div className="mb-6">
                                    <div className="text-3xl font-bold text-gray-900 mb-1">
                                        {pkg.credits}
                                    </div>
                                    <div className="text-sm text-gray-500">Credits</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        ({Math.floor(pkg.credits / pricingData.chatCost)} conversations)
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handlePackageSelect(key as 'BASIC' | 'STANDARD' | 'PREMIUM')}
                                    className={`w-full ${
                                        selectedPackage === key
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {selectedPackage === key ? 'Selected' : 'Select Package'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Purchase Section */}
                {selectedPackage && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Complete Your Purchase
                        </h3>
                        
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Package:</span>
                                <span className="font-semibold">{selectedPackage}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Credits:</span>
                                <span className="font-semibold">{pricingData.packages[selectedPackage]?.credits || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-600">Conversations:</span>
                                <span className="font-semibold">
                                    {pricingData.packages[selectedPackage]?.credits && pricingData.chatCost 
                                        ? Math.floor(pricingData.packages[selectedPackage].credits / pricingData.chatCost)
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                                <span>Total:</span>
                                <span className="text-green-600">
                                    ${pricingData.packages[selectedPackage]?.price || 'N/A'} {pricingData.packages[selectedPackage]?.currency || 'USD'}
                                </span>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Payment Method:</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(pricingData.paymentMethods).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedPaymentMethod(key as 'CARD' | 'BANK_TRANSFER' | 'WALLET')}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                                            selectedPaymentMethod === key
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={handlePurchase}
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center">
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Processing...</span>
                                    </div>
                                ) : (
                                    'Purchase Credits'
                                )}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Successful!</h3>
                            <p className="text-gray-600 mb-6">
                                Your credits have been added to your account. You can now start chatting with Rin!
                            </p>
                            <Button
                                onClick={() => setShowSuccess(false)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Canceled Modal */}
                {showCanceled && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Canceled</h3>
                            <p className="text-gray-600 mb-6">
                                Your purchase has been canceled. You can try again anytime.
                            </p>
                            <Button
                                onClick={() => setShowCanceled(false)}
                                className="bg-gray-600 hover:bg-gray-700"
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                )}

                {/* Error Modal */}
                {showError && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Failed</h3>
                            <p className="text-gray-600 mb-6">
                                {errorMessage}
                            </p>
                            <Button
                                onClick={() => setShowError(false)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 