"use client";

import React, { useState } from 'react';
import { 
    CreditCardIcon, 
    ClockIcon, 
    BanknotesIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import PaymentAccount from '@/components/payment/PaymentAccount';
import PaymentHistory from '@/components/payment/PaymentHistory';
import CreditTransactionHistory from '@/components/payment/CreditTransactionHistory';

export default function PaymentPage() {
    const [activeTab, setActiveTab] = useState<'account' | 'history' | 'credits'>('account');

    const tabs = [
        {
            id: 'account',
            name: 'Payment Account',
            icon: CreditCardIcon,
            description: 'Manage your account balance and deposits'
        },
        {
            id: 'history',
            name: 'Payment History',
            icon: ClockIcon,
            description: 'View all your payment transactions'
        },
        {
            id: 'credits',
            name: 'Credit History',
            icon: CreditCardIcon,
            description: 'Track your AI credit transactions'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <BanknotesIcon className="w-8 h-8 text-green-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Payment Center</h1>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Manage your payments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'account' | 'history' | 'credits')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="py-8">
                {activeTab === 'account' && <PaymentAccount />}
                {activeTab === 'history' && <PaymentHistory />}
                {activeTab === 'credits' && <CreditTransactionHistory />}
            </div>
        </div>
    );
} 