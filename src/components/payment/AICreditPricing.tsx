'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface CreditPackage {
    credits: number;
    price: number;
    currency: string;
    description: string;
    bonus?: string;
    features: string[];
    popular?: boolean;
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

export default function AICreditPricing() {
    const [selectedPackage, setSelectedPackage] = useState<'BASIC' | 'STANDARD' | 'PREMIUM' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showCanceled, setShowCanceled] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUALLY'>('MONTHLY');

    // Mock pricing data - in real app, this would come from API
    const pricingData: PricingData = {
        chatCost: 2,
        packages: {
            BASIC: {
                credits: 50,
                price: 4.99,
                currency: 'USD',
                description: 'Perfect for casual users who want to explore AI chat',
                features: [
                    'Chat with Rin AI',
                    'Environmental Tips',
                    'Basic Conversation History',
                    '2 Credits per Chat'
                ]
            },
            STANDARD: {
                credits: 150,
                price: 12.99,
                currency: 'USD',
                description: 'Great for regular users who want more conversations',
                bonus: '15% bonus credits',
                popular: true,
                features: [
                    'Chat with Rin AI',
                    'Environmental Tips',
                    'Full Conversation History',
                    'Personality Analysis',
                    'Priority Support',
                    '2 Credits per Chat'
                ]
            },
            PREMIUM: {
                credits: 350,
                price: 24.99,
                currency: 'USD',
                description: 'Best value for power users and businesses',
                bonus: '25% bonus credits',
                features: [
                    'Unlimited Chat with Rin AI',
                    'Advanced Environmental Analysis',
                    'Complete Conversation History',
                    'Detailed Personality Reports',
                    'Priority Support',
                    'Custom AI Training',
                    '2 Credits per Chat'
                ]
            }
        },
        paymentMethods: {
            CARD: 'Credit/Debit Card',
            BANK_TRANSFER: 'Bank Transfer',
            WALLET: 'Digital Wallet'
        },
        features: {
            chatWithRin: '2 credits per conversation',
            environmentalTips: 'Free',
            historyAccess: 'Free',
            personalityAnalysis: 'Free'
        }
    };

    const handlePackageSelect = (pkg: 'BASIC' | 'STANDARD' | 'PREMIUM') => {
        setSelectedPackage(pkg);
    };

    const handlePurchase = async () => {
        if (!selectedPackage) return;

        setIsProcessing(true);
        
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }, 2000);
    };

    const handleCancel = () => {
        setShowCanceled(true);
        setTimeout(() => setShowCanceled(false), 3000);
    };

    const getPrice = (basePrice: number) => {
        if (billingCycle === 'ANNUALLY') {
            return basePrice * 10; // 10 months for annual pricing
        }
        return basePrice;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        SIMPLE, TRANSPARENT PRICING
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Choose the perfect AI credit package for your environmental journey. All plans include instant access.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-800 rounded-2xl p-2 flex items-center space-x-2">
                        <button
                            onClick={() => setBillingCycle('MONTHLY')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                                billingCycle === 'MONTHLY'
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            MONTHLY
                        </button>
                        <button
                            onClick={() => setBillingCycle('ANNUALLY')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 relative ${
                                billingCycle === 'ANNUALLY'
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            ANNUALLY
                            {billingCycle === 'ANNUALLY' && (
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    SAVE 20%
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {Object.entries(pricingData.packages).map(([key, pkg]) => (
                        <div
                            key={key}
                            className={`relative bg-gray-800 rounded-3xl p-8 border-2 transition-all duration-500 hover:scale-105 ${
                                pkg.popular 
                                    ? 'border-green-500 shadow-2xl shadow-green-500/20' 
                                    : 'border-gray-700 hover:border-green-400'
                            } ${pkg.popular ? 'ring-4 ring-green-500/20' : ''}`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}
                            
                            <div className="text-center">
                                {/* Package Icon */}
                                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                                    pkg.popular 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                        : 'bg-gray-700'
                                }`}>
                                    <span className="text-2xl font-bold text-white">
                                        {key.charAt(0)}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {key.charAt(0) + key.slice(1).toLowerCase()}
                                </h3>
                                
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-white">
                                        ${getPrice(pkg.price).toFixed(2)}
                                    </span>
                                    <span className="text-gray-400">/{billingCycle === 'ANNUALLY' ? 'year' : 'month'}</span>
                                </div>
                                
                                <p className="text-gray-400 mb-8 text-sm leading-relaxed">{pkg.description}</p>
                                
                                {/* Credits Display */}
                                <div className="mb-8 p-4 bg-gray-700 rounded-2xl">
                                    <div className="text-3xl font-bold text-green-400 mb-1">
                                        {pkg.credits}
                                    </div>
                                    <div className="text-sm text-gray-300">Credits</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        ({Math.floor(pkg.credits / pricingData.chatCost)} conversations)
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-8 text-left">
                                    {pkg.features.map((feature, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handlePackageSelect(key as 'BASIC' | 'STANDARD' | 'PREMIUM')}
                                    className={`w-full font-semibold py-4 rounded-2xl transition-all duration-300 ${
                                        selectedPackage === key
                                            ? pkg.popular 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                            : pkg.popular
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                                    }`}
                                >
                                    {selectedPackage === key ? 'Selected Plan' : `Upgrade to ${key.charAt(0) + key.slice(1).toLowerCase()}`}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Purchase Section */}
                {selectedPackage && (
                    <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-700">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">
                            Complete Your Purchase
                        </h3>
                        
                        <div className="bg-gray-700 rounded-2xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-300">Package:</span>
                                <span className="font-semibold text-white">{selectedPackage}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-300">Credits:</span>
                                <span className="font-semibold text-white">{pricingData.packages[selectedPackage].credits}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-300">Conversations:</span>
                                <span className="font-semibold text-white">
                                    {Math.floor(pricingData.packages[selectedPackage].credits / pricingData.chatCost)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold border-t border-gray-600 pt-4">
                                <span className="text-gray-300">Total:</span>
                                <span className="text-green-400">
                                    ${getPrice(pricingData.packages[selectedPackage].price).toFixed(2)} {pricingData.packages[selectedPackage].currency}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={handlePurchase}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 rounded-2xl disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Purchase Credits'}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white font-semibold py-4 rounded-2xl"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-3xl p-8 max-w-md mx-4 text-center border border-gray-700">
                            <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Purchase Successful!</h3>
                            <p className="text-gray-300 mb-6">
                                Your credits have been added to your account. You can now start chatting with Rin!
                            </p>
                            <Button
                                onClick={() => setShowSuccess(false)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-2xl"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Canceled Modal */}
                {showCanceled && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-3xl p-8 max-w-md mx-4 text-center border border-gray-700">
                            <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Purchase Canceled</h3>
                            <p className="text-gray-300 mb-6">
                                Your purchase has been canceled. You can try again anytime.
                            </p>
                            <Button
                                onClick={() => setShowCanceled(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-2xl"
                            >
                                OK
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 