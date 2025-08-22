"use client";

import React, { useState, useEffect } from 'react';
import { 
    SparklesIcon, 
    CreditCardIcon, 
    ExclamationTriangleIcon,
    CheckCircleIcon,
    StarIcon,
    BanknotesIcon,
    ChartBarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { paymentApi, aiCreditsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

interface CreditPackage {
    id: string;
    credits: number;
    price: number;
    description: string;
    pricePerCredit: number;
}

interface PaymentAccount {
    accountNumber: string;
    balance: number;
    currency: string;
    status: string;
}

interface CreditInfo {
    currentCredits: number;
    chatCost: number;
    canChat: boolean;
    possibleChats: number;
    isLowOnCredits: boolean;
    maxCredits?: number;
    autoRefillEnabled?: boolean;
}

export default function AICreditPurchase() {
    const { user } = useAuth();
    const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
    const [paymentAccount, setPaymentAccount] = useState<PaymentAccount | null>(null);
    const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadPurchaseData();
        }
    }, [user?.id]);

    const loadPurchaseData = async () => {
        try {
            setIsLoading(true);
            setErrorMessage('');

            // Load credit packages
            await loadCreditPackages();
            
            // Load payment account
            await loadPaymentAccount();
            
            // Load current credit info
            await loadCreditInfo();

        } catch (error: any) {
            console.error('Error loading purchase data:', error);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCreditPackages = async () => {
        try {
            console.log('📦 Loading credit packages...');
            const response = await paymentApi.getCreditPackages();
            
            if (response.success && response.data) {
                const packages = response.data.packages || [];
                setCreditPackages(packages);
                console.log('✅ Credit packages loaded:', packages);
            }
        } catch (error: any) {
            console.error('❌ Error loading credit packages:', error);
            // Set fallback packages
            setCreditPackages([
                {
                    id: 'basic',
                    credits: 50,
                    price: 4.99,
                    description: 'Basic Package - Perfect for casual users',
                    pricePerCredit: 0.10
                },
                {
                    id: 'standard', 
                    credits: 150,
                    price: 12.99,
                    description: 'Standard Package - Great for regular users',
                    pricePerCredit: 0.087
                },
                {
                    id: 'premium',
                    credits: 350,
                    price: 24.99,
                    description: 'Premium Package - Best value for power users',
                    pricePerCredit: 0.071
                }
            ]);
        }
    };

    const loadPaymentAccount = async () => {
        try {
            console.log('🏦 Loading payment account for AI credit purchase...');
            const response = await paymentApi.getUserPaymentAccount();
            
            if (response.success && response.data) {
                setPaymentAccount(response.data.account);
            } else if (response.error === 'NO_ACCOUNT_FOUND') {
                setPaymentAccount(null);
                setErrorMessage('You need to create a payment account first before purchasing credits. You can do this from the Payment Account section.');
            } else if (response.error === 'USER_NOT_APPROVED') {
                setPaymentAccount(null);
                setErrorMessage('Your account must be approved before you can purchase AI credits. Please wait for account approval or contact your administrator.');
            }
        } catch (error: any) {
            console.error('❌ Error loading payment account:', error);
            setPaymentAccount(null);
            
            if (error.message && error.message.includes('approval')) {
                setErrorMessage('Your account must be approved before you can purchase AI credits. Please wait for account approval or contact your administrator.');
            } else {
                setErrorMessage('Unable to load payment account. Please try again or create a new payment account.');
            }
        }
    };

    const loadCreditInfo = async () => {
        try {
            console.log('💰 Loading credit info...');
            const response = await aiCreditsApi.getCreditBalance();
            
            if (response.success && response.data) {
                setCreditInfo(response.data);
                console.log('✅ Credit info loaded:', response.data);
            }
        } catch (error: any) {
            console.error('❌ Error loading credit info:', error);
            setCreditInfo({
                currentCredits: 0,
                chatCost: 2,
                canChat: false,
                possibleChats: 0,
                isLowOnCredits: true
            });
        }
    };

    const handlePurchase = async () => {
        if (!selectedPackage || !paymentAccount) return;

        const packageDetails = creditPackages.find(pkg => pkg.id === selectedPackage);
        if (!packageDetails) return;

        // Check if user has sufficient balance
        if (paymentAccount.balance < packageDetails.price) {
            setErrorMessage(`Insufficient account balance. You need $${packageDetails.price.toFixed(2)} but only have $${paymentAccount.balance.toFixed(2)}. Please add funds to your account first.`);
            return;
        }

        try {
            setIsPurchasing(true);
            setErrorMessage('');

            console.log('💳 Purchasing credits...', {
                package: selectedPackage,
                credits: packageDetails.credits,
                price: packageDetails.price
            });

            const response = await paymentApi.purchaseCredits({
                creditPackageId: selectedPackage,
                amount: packageDetails.price
            });

            if (response.success && response.data) {
                console.log('✅ Credit purchase successful:', response.data);
                
                const transaction = response.data.transaction;
                setSuccessMessage(`🎉 Successfully purchased ${transaction?.creditsPurchased || packageDetails.credits} AI credits for $${packageDetails.price.toFixed(2)}! Your credits are now available for use.`);
                
                // Refresh data to show updated balances
                await loadPurchaseData();
                
                setSelectedPackage(null);
                setShowConfirmModal(false);
                
                setTimeout(() => setSuccessMessage(''), 8000);
            } else {
                setErrorMessage(response.message || 'Failed to purchase credits');
            }
        } catch (error: any) {
            console.error('❌ Credit purchase failed:', error);
            setErrorMessage(`Purchase failed: ${error.message}`);
        } finally {
            setIsPurchasing(false);
        }
    };

    const getPackagePopularity = (packageId: string) => {
        if (packageId === 'standard') return { isPopular: true, badge: 'Most Popular' };
        if (packageId === 'premium') return { isPopular: false, badge: 'Best Value' };
        return { isPopular: false, badge: null };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-4">Loading credit packages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Credit Balance */}
                {creditInfo && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">AI Credits</h3>
                            <SparklesIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-blue-600">{creditInfo.currentCredits}</p>
                            <p className="text-sm text-gray-600">
                                {creditInfo.possibleChats} conversations available
                            </p>
                            <p className="text-xs text-gray-500">
                                Cost: {creditInfo.chatCost} credits per chat
                            </p>
                        </div>
                        {creditInfo.isLowOnCredits && (
                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                                    <p className="text-xs text-yellow-800">Running low on credits!</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Account Balance */}
                {paymentAccount && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Account Balance</h3>
                            <BanknotesIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-3xl font-bold text-green-600">
                                ${paymentAccount.balance.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">{paymentAccount.currency}</p>
                            <p className="text-xs text-gray-500">
                                Account: {paymentAccount.accountNumber}
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                {creditInfo && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Usage Stats</h3>
                            <ChartBarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Can Chat</span>
                                <span className={`text-sm font-medium ${creditInfo.canChat ? 'text-green-600' : 'text-red-600'}`}>
                                    {creditInfo.canChat ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Auto Refill</span>
                                <span className="text-sm text-green-600">Enabled</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Max Limit</span>
                                <span className="text-sm text-gray-600">Unlimited</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error/Success Messages */}
            {successMessage && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-8 h-8" />
                        <div>
                            <h3 className="text-xl font-bold">Purchase Successful!</h3>
                            <p className="text-green-100">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="w-8 h-8" />
                        <div>
                            <h3 className="text-xl font-bold">Purchase Error</h3>
                            <p className="text-red-100">{errorMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {!paymentAccount && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3">
                        <CreditCardIcon className="w-8 h-8 text-blue-600" />
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">Payment Account Required</h3>
                            <p className="text-blue-800">You need to create a payment account before purchasing credits. Please go to the Payment Account tab to get started.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Packages */}
            {paymentAccount && (
                <div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Credit Package</h2>
                        <p className="text-lg text-gray-600">
                            Select the perfect package for your AI conversation needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {creditPackages.map((pkg) => {
                            const popularity = getPackagePopularity(pkg.id);
                            const isSelected = selectedPackage === pkg.id;
                            const canAfford = paymentAccount.balance >= pkg.price;

                            return (
                                <div
                                    key={pkg.id}
                                    className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                                        isSelected
                                            ? 'border-green-500 ring-4 ring-green-200'
                                            : popularity.isPopular
                                                ? 'border-blue-500 shadow-blue-200'
                                                : 'border-gray-200 hover:border-green-300'
                                    } ${!canAfford ? 'opacity-60' : ''}`}
                                    onClick={() => canAfford && setSelectedPackage(isSelected ? null : pkg.id)}
                                >
                                    {popularity.badge && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                                                popularity.isPopular ? 'bg-blue-500' : 'bg-purple-500'
                                            }`}>
                                                {popularity.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        {/* Package Header */}
                                        <div className="mb-6">
                                            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                                                isSelected
                                                    ? 'bg-green-500'
                                                    : popularity.isPopular
                                                        ? 'bg-blue-500'
                                                        : 'bg-gray-500'
                                            }`}>
                                                <SparklesIcon className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                                                {pkg.id} Package
                                            </h3>
                                            <p className="text-sm text-gray-600">{pkg.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                                ${pkg.price.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ${pkg.pricePerCredit.toFixed(3)} per credit
                                            </div>
                                        </div>

                                        {/* Credits */}
                                        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                                {pkg.credits}
                                            </div>
                                            <div className="text-sm text-gray-600">Credits</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ≈ {Math.floor(pkg.credits / (creditInfo?.chatCost || 2))} conversations
                                            </div>
                                        </div>

                                        {/* Affordability indicator */}
                                        {!canAfford && (
                                            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-xs text-red-800">
                                                    Insufficient balance. Need ${(pkg.price - paymentAccount.balance).toFixed(2)} more.
                                                </p>
                                            </div>
                                        )}

                                        {/* Select button */}
                                        <Button
                                            onClick={() => canAfford && setSelectedPackage(isSelected ? null : pkg.id)}
                                            disabled={!canAfford}
                                            className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 ${
                                                isSelected
                                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                                    : canAfford
                                                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {isSelected ? 'Selected' : canAfford ? 'Select Package' : 'Insufficient Balance'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Purchase Button */}
                    {selectedPackage && (
                        <div className="text-center">
                            <Button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={isPurchasing}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50"
                            >
                                {isPurchasing ? (
                                    <div className="flex items-center">
                                        <LoadingSpinner />
                                        <span className="ml-2">Processing Purchase...</span>
                                    </div>
                                ) : (
                                    `Purchase ${selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)} Package`
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Confirm Purchase</h3>
                        
                        {(() => {
                            const pkg = creditPackages.find(p => p.id === selectedPackage);
                            if (!pkg) return null;
                            
                            return (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="text-center mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                                {pkg.id} Package
                                            </h4>
                                            <p className="text-sm text-gray-600">{pkg.description}</p>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Credits:</span>
                                                <span className="font-semibold">{pkg.credits}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Conversations:</span>
                                                <span className="font-semibold">
                                                    ≈{Math.floor(pkg.credits / (creditInfo?.chatCost || 2))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-semibold">${pkg.price.toFixed(2)}</span>
                                            </div>
                                            <div className="border-t pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Current Balance:</span>
                                                    <span className="font-semibold">${paymentAccount?.balance.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">After Purchase:</span>
                                                    <span className="font-semibold">
                                                        ${((paymentAccount?.balance || 0) - pkg.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex">
                                            <SparklesIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium">Purchase Information</p>
                                                <p>Credits will be added to your account instantly and are ready to use immediately.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        <Button
                                            onClick={() => setShowConfirmModal(false)}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handlePurchase}
                                            disabled={isPurchasing}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl disabled:opacity-50"
                                        >
                                            {isPurchasing ? (
                                                <div className="flex items-center justify-center">
                                                    <LoadingSpinner />
                                                    <span className="ml-2">Processing...</span>
                                                </div>
                                            ) : (
                                                'Confirm Purchase'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
} 