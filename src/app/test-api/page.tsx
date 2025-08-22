"use client";

import { useState } from 'react';
import { authApi } from '@/lib/api';

export default function TestApiPage() {
    const [status, setStatus] = useState<string>('');
    const [error, setError] = useState<string>('');

    const testBackendConnectivity = async () => {
        setStatus('Testing backend connectivity...');
        setError('');
        
        try {
            const isReachable = await authApi.healthCheck();
            if (isReachable) {
                setStatus('✅ Backend is reachable');
            } else {
                setStatus('❌ Backend is not reachable');
            }
        } catch (err: any) {
            setError(err.message);
            setStatus('❌ Error testing connectivity');
        }
    };

    const testRegistrationEndpoint = async () => {
        setStatus('Testing registration endpoint...');
        setError('');
        
        try {
            const testPayload = {
                firstName: 'Test',
                lastName: 'User',
                userName: 'testuser123',
                email: 'test@example.com',
                password: 'TestPass123',
                companyRole: 'OWNER',
                companyName: 'Test Company',
                companyAddress: '123 Test St, Test City, TS 12345',
                industry: 'Technology'
            };
            
            const validation = authApi.validateRegistrationPayload(testPayload);
            console.log('Validation result:', validation);
            
            if (!validation.isValid) {
                setError(`Validation failed: ${validation.errors.join(', ')}`);
                setStatus('❌ Payload validation failed');
                return;
            }
            
            const response = await authApi.register(testPayload);
            setStatus('✅ Registration endpoint test successful');
            console.log('Registration response:', response);
        } catch (err: any) {
            setError(err.message);
            setStatus('❌ Registration endpoint test failed');
        }
    };

    const testSpringBootBackend = async () => {
        setStatus('Testing if backend is Spring Boot...');
        setError('');
        
        try {
            const result = await authApi.testSpringBootBackend();
            if (result.isSpringBoot) {
                setStatus('✅ Backend is confirmed to be Spring Boot');
            } else {
                setStatus('❌ Backend does not appear to be Spring Boot');
                setError(`Details: ${JSON.stringify(result.details, null, 2)}`);
            }
        } catch (err: any) {
            setError(err.message);
            setStatus('❌ Error testing Spring Boot backend');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">API Test Page</h1>
                
                <div className="space-y-4">
                    <button
                        onClick={testBackendConnectivity}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Test Backend Connectivity
                    </button>
                    
                    <button
                        onClick={testSpringBootBackend}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Test Spring Boot Backend
                    </button>
                    
                    <button
                        onClick={testRegistrationEndpoint}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Test Registration Endpoint
                    </button>
                </div>
                
                {status && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm font-medium">{status}</p>
                    </div>
                )}
                
                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 