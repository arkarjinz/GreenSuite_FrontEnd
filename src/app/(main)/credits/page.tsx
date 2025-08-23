"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { aiCreditsApi, refillApi } from '@/lib/api';
import { ClockIcon, CreditCardIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
 
export default function CreditsPage() {
    const { user } = useAuth();
    const [creditInfo, setCreditInfo] = useState<any>(null);
    const [refillInfo, setRefillInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadCreditData();
        }
    }, [user]);

    const loadCreditData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load credit balance
            const creditResponse = await aiCreditsApi.getCreditBalance();
            if (creditResponse.success) {
                setCreditInfo(creditResponse.data);
            }

            // Load refill information
            const refillResponse = await refillApi.getRefillStats();
            if (refillResponse.success) {
                setRefillInfo(refillResponse.data);
            }

        } catch (err: any) {
            console.error('Error loading credit data:', err);
            setError(err.message || 'Failed to load credit information');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading credit information...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadCreditData}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Credits</h1>
                    <p className="text-gray-600">Manage your AI chat credits and view refill information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Credit Balance Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Current Balance</h2>
                            <CreditCardIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        
                        {creditInfo && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                                        {creditInfo.currentCredits || 0}
                                    </div>
                                    <p className="text-gray-600">Available Credits</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {creditInfo.chatCost || 2}
                                        </div>
                                        <p className="text-sm text-gray-600">Cost per Chat</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {creditInfo.possibleChats || 0}
                                        </div>
                                        <p className="text-sm text-gray-600">Possible Chats</p>
                                    </div>
                                </div>

                                {creditInfo.isLowOnCredits && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800 text-sm">
                                            ⚠️ You're running low on credits! Credits will auto-refill every 5 minutes.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Refill Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Auto-Refill Status</h2>
                            <ClockIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        {refillInfo && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 mb-2">
                                        {refillInfo.eligibleForRefill ? 'Active' : 'Paused'}
                                    </div>
                                    <p className="text-gray-600">
                                        {refillInfo.eligibleForRefill 
                                            ? 'Credits will auto-refill every 5 minutes'
                                            : 'Auto-refill paused (at maximum credits)'
                                        }
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {refillInfo.totalRefilled || 0}
                                        </div>
                                        <p className="text-sm text-gray-600">Total Refilled</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {refillInfo.refillCount || 0}
                                        </div>
                                        <p className="text-sm text-gray-600">Refill Events</p>
                                    </div>
                                </div>

                                {refillInfo.lastRefill && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-blue-800 text-sm">
                                            Last refill: {new Date(refillInfo.lastRefill).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Credit System Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Credit System Information</h2>
                            <ChartBarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-2">50</div>
                                <p className="text-gray-600">Maximum Credits</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-2">5 min</div>
                                <p className="text-gray-600">Refill Interval</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
                                <p className="text-gray-600">Credits per Refill</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-purple-800 text-sm">
                                💡 <strong>How it works:</strong> Your credits automatically refill every 5 minutes, 
                                adding 1 credit at a time until you reach the maximum of 50 credits. 
                                Each conversation with Rin costs 2 credits.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={loadCreditData}
                        className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>Refresh Credit Information</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 