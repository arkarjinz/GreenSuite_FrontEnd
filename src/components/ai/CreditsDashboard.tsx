"use client";

import React, { useState, useEffect } from 'react';
import { CreditCardIcon, SparklesIcon, ShoppingCartIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { aiCreditsApi } from '@/lib/api';
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
    
    // Auto-refill stats
    autoRefillEnabled?: boolean;
    lastAutoRefill?: string;
    nextAutoRefill?: string;
    autoRefillRate?: number;
    autoRefillInterval?: number;
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
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [isClient, setIsClient] = useState(false);

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
                aiCreditsApi.getCreditPricing()
            ]);

            if (statsResponse.success) {
                setCreditStats(statsResponse.data);
            }

            if (pricingResponse.success) {
                setPricingInfo(pricingResponse.data);
            }
        } catch (error) {
            console.error('Error loading credit data:', error);
            // Set default credit stats if API fails
            setCreditStats({
                currentCredits: 50,
                chatCost: 2,
                canChat: true,
                possibleChats: 25,
                isLowOnCredits: false,
                autoRefillEnabled: false
            });
            
            // Set default pricing info
            setPricingInfo({
                chatCost: 2,
                pricingTiers: {
                    basic: {
                        credits: 50,
                        price: 4.99,
                        currency: "USD",
                        description: "Perfect for casual users"
                    },
                    standard: {
                        credits: 150,
                        price: 12.99,
                        currency: "USD",
                        description: "Great for regular users",
                        bonus: "15% bonus credits"
                    },
                    premium: {
                        credits: 350,
                        price: 24.99,
                        currency: "USD",
                        description: "Best value for power users",
                        bonus: "25% bonus credits"
                    }
                }
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
        try {
            setIsPurchasing(true);
            
            // For demo purposes - in real implementation, integrate with Stripe/PayPal
            const response = await aiCreditsApi.purchaseCredits(tier.credits, 'demo_payment');
            
            if (response.success) {
                setPurchaseSuccess(true);
                setTimeout(() => setPurchaseSuccess(false), 5000);
                
                // Refresh credit data
                await loadCreditData();
                
                // Update user context
                if (updateUser && creditStats) {
                    updateUser({
                        ...user,
                        aiCredits: (user.aiCredits || 0) + tier.credits,
                        canChat: true,
                        isLowOnCredits: false
                    });
                }
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

                {/* Auto-Refill Information */}
                {creditStats?.autoRefillEnabled && (
                    <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <SparklesIcon className="w-8 h-8" />
                            <div>
                                <h3 className="text-xl font-bold">Auto-Refill Active! 🎉</h3>
                                <p className="text-blue-100">
                                    You receive {creditStats.autoRefillRate || 1} credit every {creditStats.autoRefillInterval || 5} minutes automatically.
                                    {creditStats.nextAutoRefill && (
                                        <span className="block mt-1">
                                            Next refill: {new Date(creditStats.nextAutoRefill).toLocaleTimeString()}
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
                    
                    {pricingInfo && pricingInfo.pricingTiers && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {Object.entries(pricingInfo.pricingTiers).map(([tierName, tier]: [string, any]) => (
                                <div 
                                    key={tierName}
                                    className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                                        tierName === 'standard' 
                                            ? 'border-green-400 ring-2 ring-green-200' 
                                            : 'border-gray-200 hover:border-green-300'
                                    }`}
                                >
                                    {tierName === 'standard' && (
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-t-2xl">
                                            <span className="font-semibold">Most Popular</span>
                                        </div>
                                    )}
                                    
                                    <div className="p-8">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                                                {tierName}
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
                                            onClick={() => handlePurchase(tierName, tier)}
                                            disabled={isPurchasing}
                                            className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                                                tierName === 'standard'
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
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
            </div>
        </div>
    );
} 