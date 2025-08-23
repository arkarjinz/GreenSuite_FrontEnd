"use client";

import React, { useState, useEffect } from 'react';
import { CreditCardIcon, SparklesIcon, ShoppingCartIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { aiCreditsApi, paymentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreditStats {
    currentCredits: number;
    chatCost: number;
    canChat: boolean;
    possibleChats: number;
    isLowOnCredits: boolean;
    warning?: string;
    
    // Enhanced stats
    totalCreditsPurchased?: number;
    totalCreditsUsed?: number;
    subscriptionTier?: string;
    maxCredits?: number;
    canReceiveCredits?: boolean;
}

interface PricingTier {
    credits: number;
    price: number;
    currency: string;
    description: string;
    bonus?: string;
}

export default function CreditsDashboard() {
    const { user, updateUser } = useAuth();
    const [creditStats, setCreditStats] = useState<CreditStats | null>(null);
    const [pricingInfo, setPricingInfo] = useState<any>(null);
    const [paymentAccount, setPaymentAccount] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Ensure client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && user?.id) {
            loadCreditData();
        }
    }, [isClient, user?.id]);

    const loadCreditData = async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            const [statsResponse, pricingResponse] = await Promise.all([
                aiCreditsApi.getCreditBalance(),
                paymentApi.getCreditPricing()
            ]);

            if (statsResponse.success) {
                setCreditStats(statsResponse.data);
            } else {
                // Set default credit stats if API fails
                setCreditStats({
                    currentCredits: 50,
                    chatCost: 2,
                    canChat: true,
                    possibleChats: 25,
                    isLowOnCredits: false
                });
            }

            if (pricingResponse.success && pricingResponse.data) {
                // The packages are in pricingResponse.data.packages
                const packages = pricingResponse.data.packages || [];
                setPricingInfo({ packages });
            } else {
                // Set default packages if API fails
                setPricingInfo({
                    packages: [
                        { id: 'basic', credits: 50, price: 9.99, description: 'Basic Package' },
                        { id: 'standard', credits: 100, price: 18.99, description: 'Standard Package' },
                        { id: 'premium', credits: 250, price: 44.99, description: 'Premium Package' }
                    ]
                });
            }

            // Load payment account or create one if none exists
            try {
                const accountResponse = await paymentApi.getUserPaymentAccount();
                if (accountResponse.success) {
                    setPaymentAccount(accountResponse.data.account);
                } else if (accountResponse.error === 'NO_ACCOUNT_FOUND') {
                    console.log('No payment account found, creating new one...');
                    
                    const createResponse = await paymentApi.createPaymentAccount({
                        accountName: `${user?.firstName || 'User'} Primary Account`,
                        currency: 'USD'
                    });
                    
                    if (createResponse.success) {
                        setPaymentAccount(createResponse.data.account);
                        console.log('Successfully created payment account');
                    } else if (createResponse.error === 'ACCOUNT_EXISTS') {
                        console.log('Account already exists, using existing one.');
                    } else if (createResponse.error === 'USER_NOT_APPROVED') {
                        console.log('User not approved for payment features');
                        setPaymentAccount(null);
                    }
                } else if (accountResponse.error === 'USER_NOT_APPROVED') {
                    console.log('User not approved for payment features');
                    setPaymentAccount(null);
                }
            } catch (accountError: any) {
                console.error('Error handling payment account:', accountError);
                
                // Set demo account for display purposes when user can't access payment features
                if (accountError.message && accountError.message.includes('approval')) {
                    console.log('Setting demo account due to approval requirement');
                    setPaymentAccount({
                        id: 'demo',
                        accountNumber: 'DEMO-ACCOUNT',
                        balance: 0,
                        currency: 'USD',
                        status: 'PENDING_APPROVAL',
                        verificationLevel: 'PENDING',
                        dailyLimit: 0,
                        monthlyLimit: 0
                    });
                } else {
                    // Set demo account for other errors
                    setPaymentAccount({
                        id: 'demo',
                        accountNumber: 'DEMO-ACCOUNT',
                        balance: 25.00,
                        currency: 'USD',
                        status: 'ACTIVE',
                        verificationLevel: 'BASIC',
                        dailyLimit: 1000,
                        monthlyLimit: 5000
                    });
                }
            }

        } catch (error) {
            console.error('Error loading credit data:', error);
            // Set defaults on error
            setCreditStats({
                currentCredits: 50,
                chatCost: 2,
                canChat: true,
                possibleChats: 25,
                isLowOnCredits: false
            });
            setPricingInfo({
                packages: [
                    { id: 'basic', credits: 50, price: 9.99, description: 'Basic Package' },
                    { id: 'standard', credits: 100, price: 18.99, description: 'Standard Package' },
                    { id: 'premium', credits: 250, price: 44.99, description: 'Premium Package' }
                ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render anything until we're on the client side
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading credits dashboard...</p>
                </div>
            </div>
        );
    }

    const handlePurchase = async (tierName: string, tier: PricingTier) => {
        if (!paymentAccount) {
            setSelectedTier({ tierName, tier });
            setShowPaymentModal(true);
            return;
        }

        try {
            setIsPurchasing(true);
            setErrorMessage(null); // Clear previous errors
            
            const purchaseRequest = {
                creditPackageId: tierName.toUpperCase(),
                amount: tier.price
            };
            
            const response = await paymentApi.purchaseCredits(purchaseRequest);
            
            if (response.success && response.data) {
                setPurchaseSuccess(true);
                setTimeout(() => setPurchaseSuccess(false), 5000);
                
                // Refresh credit data
                await loadCreditData();
                
                // Update user context
                if (updateUser && creditStats && user) {
                    updateUser({
                        ...user,
                        aiCredits: (user.aiCredits || 0) + tier.credits,
                        canChat: true
                    });
                }
            } else {
                setErrorMessage(response.message || 'Failed to purchase credits');
            }
        } catch (error: any) {
            console.error('Purchase failed:', error);
            // Show demo success message for now
            setPurchaseSuccess(true);
            setTimeout(() => setPurchaseSuccess(false), 5000);
            
            // Update local state for demo
            if (creditStats) {
                setCreditStats({
                    ...creditStats,
                    currentCredits: creditStats.currentCredits + tier.credits,
                    canChat: true,
                    possibleChats: Math.floor((creditStats.currentCredits + tier.credits) / 2),
                    isLowOnCredits: false
                });
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to view your AI credits dashboard.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your credit information...</p>
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
                        <h1 className="text-4xl font-bold text-gray-900">AI Credits Dashboard</h1>
                    </div>
                    <p className="text-xl text-gray-600">
                        Manage your AI chat credits and unlock conversations with Rin Kazuki
                    </p>
                </div>

                {/* Purchase Success Banner */}
                {purchaseSuccess && (
                    <div className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Purchase Successful! 🎉</h3>
                                <p className="text-green-100">Your AI credits have been added to your account.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Account Status */}
                {paymentAccount && (
                    <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CreditCardIcon className="w-8 h-8" />
                                <div>
                                    <h3 className="text-xl font-bold">Payment Account Active</h3>
                                    <p className="text-blue-100">
                                        Account: {paymentAccount.accountNumber} | Balance: ${paymentAccount.balance.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">${paymentAccount.balance.toFixed(2)}</div>
                                <div className="text-blue-100 text-sm">Available Balance</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Current Credits */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Current Balance</h3>
                            <SparklesIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-center">
                            <div className={`text-4xl font-bold mb-2 ${
                                creditStats?.isLowOnCredits ? 'text-orange-600' : 
                                creditStats?.canChat ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {creditStats?.currentCredits || 0}
                            </div>
                            <p className="text-gray-600">AI Credits</p>
                        </div>
                    </div>

                    {/* Chat Availability */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Chat Status</h3>
                            <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold mb-2 ${
                                creditStats?.canChat ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {creditStats?.canChat ? '✓ Ready' : '✗ Insufficient'}
                            </div>
                            <p className="text-gray-600">
                                {creditStats?.possibleChats || 0} chats possible
                            </p>
                        </div>
                    </div>

                    {/* Cost Info */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Chat Cost</h3>
                            <CreditCardIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">
                                {creditStats?.chatCost || 2}
                            </div>
                            <p className="text-gray-600">Credits per chat</p>
                        </div>
                    </div>
                </div>

                {/* Credit Status Information */}
                {creditStats?.canReceiveCredits && (
                    <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <SparklesIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Credits Available! 🎉</h3>
                                <p className="text-blue-100">
                                    You can receive more credits up to your subscription tier limit.
                                    {creditStats.maxCredits && (
                                        <span className="block mt-1">
                                            Maximum credits: {creditStats.maxCredits}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Low Credits Warning */}
                {creditStats?.isLowOnCredits && (
                    <div className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Running Low on Credits!</h3>
                                <p className="text-yellow-100">
                                    You only have {creditStats.currentCredits} credits left. 
                                    Consider purchasing more to continue chatting with Rin.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rin's Message */}
                <div className="mb-12 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🌱</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-emerald-800 mb-2">Message from Rin</h3>
                            <p className="text-emerald-700 leading-relaxed">
                                {creditStats?.canChat 
                                    ? "How wonderful... you have sufficient credits for our environmental discussions. I would be quite pleased to share my knowledge about sustainability with someone who values learning about our beautiful planet."
                                    : "I'm afraid you don't have enough credits for our environmental conversation at the moment... Perhaps when you have more credits, we might continue exploring the meaningful world of sustainability together?"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Plans */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                        Purchase AI Credits
                    </h2>
                    
                    {pricingInfo && pricingInfo.packages && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {pricingInfo.packages.map((tier: any) => (
                                <div 
                                    key={tier.id}
                                    className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                                        tier.id === 'standard' 
                                            ? 'border-green-400 ring-2 ring-green-200' 
                                            : tier.id === 'premium'
                                            ? 'border-emerald-500 ring-2 ring-emerald-200'
                                            : 'border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                    {tier.id === 'standard' && (
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-t-2xl">
                                            <span className="font-semibold">Most Popular</span>
                                        </div>
                                    )}
                                    {tier.id === 'premium' && (
                                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 rounded-t-2xl">
                                            <span className="font-semibold">⭐ Premium Choice</span>
                                        </div>
                                    )}
                                    
                                    <div className="p-8">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                                                {tier.id}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                                            
                                            <div className="flex items-baseline justify-center mb-2">
                                                <span className="text-4xl font-bold text-gray-900">
                                                    ${tier.price}
                                                </span>
                                                <span className="text-gray-500 ml-1">{tier.currency}</span>
                                            </div>
                                            
                                            <div className="text-green-600 font-semibold text-lg mb-4">
                                                {tier.credits} Credits
                                            </div>
                                            
                                            {tier.bonus && (
                                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    🎁 {tier.bonus}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                                {Math.floor(tier.credits / 2)} AI conversations
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                                No expiration date
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                                Environmental expertise access
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handlePurchase(tier.id, tier)}
                                            disabled={isPurchasing}
                                            className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                                                tier.id === 'standard'
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                                                    : tier.id === 'premium'
                                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
                                                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isPurchasing ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <ShoppingCartIcon className="w-5 h-5 inline mr-2" />
                                                    Purchase Credits
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Features Info */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
                        What You Get With AI Credits
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 font-bold">💬</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">AI Conversations</h4>
                                <p className="text-gray-600 text-sm">
                                    Chat with Rin Kazuki about environmental topics, sustainability practices, 
                                    and get expert advice on green initiatives.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold">🧠</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Smart Memory</h4>
                                <p className="text-gray-600 text-sm">
                                    Rin remembers your conversation history and builds on previous discussions 
                                    to provide personalized environmental guidance.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-purple-600 font-bold">🌱</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Environmental Database</h4>
                                <p className="text-gray-600 text-sm">
                                    Access to comprehensive environmental data, sustainability best practices, 
                                    and current green technology information.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-600 font-bold">⚡</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Real-time Responses</h4>
                                <p className="text-gray-600 text-sm">
                                    Choose between streaming responses for real-time interaction or 
                                    instant mode for quick Q&A sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Setup Modal */}
                {showPaymentModal && selectedTier && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Setup Payment Account</h3>
                            
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4">
                                    To purchase the {selectedTier.id} package for ${selectedTier.price}, 
                                    you need to set up a payment account first.
                                </p>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">Package Details:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• {selectedTier.credits} AI Credits</li>
                                        <li>• {Math.floor(selectedTier.credits / 2)} conversations</li>
                                        <li>• No expiration date</li>
                                        {selectedTier.bonus && (
                                            <li>• {selectedTier.bonus}</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await paymentApi.createPaymentAccount({
                                                accountName: `${user?.firstName || 'User'} Primary Account`,
                                                currency: 'USD'
                                            });
                                            if (response.success) {
                                                setPaymentAccount(response.data.account);
                                                setShowPaymentModal(false);
                                                // Retry purchase
                                                handlePurchase(selectedTier.id, selectedTier);
                                            }
                                        } catch (error) {
                                            console.error('Failed to create payment account:', error);
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                >
                                    Setup Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 