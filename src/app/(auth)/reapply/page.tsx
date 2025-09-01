"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { authApi, companyApi } from '@/lib/api';
import { UserPlusIcon, ExclamationTriangleIcon, InformationCircleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function ReapplyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [token, setToken] = useState('');
    const [isInitializing, setIsInitializing] = useState(true);
    const [rejectionInfo, setRejectionInfo] = useState<{
        count: number;
        remaining: number;
        isApproachingBan: boolean;
    } | null>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        companyRole: 'EMPLOYEE',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const initializePage = async () => {
            try {
        // Get reapplication token from URL params or localStorage
        const urlToken = searchParams.get('token');
        const storedToken = localStorage.getItem('reapplicationToken');
        
        if (urlToken) {
            setToken(urlToken);
            localStorage.setItem('reapplicationToken', urlToken);
        } else if (storedToken) {
            setToken(storedToken);
        } else {
            setError('No reapplication token found. Please contact your company administrator.');
        }

        // Try to parse rejection info from token or localStorage
        const storedRejectionInfo = localStorage.getItem('rejectionInfo');
        if (storedRejectionInfo) {
            try {
                const info = JSON.parse(storedRejectionInfo);
                setRejectionInfo(info);
            } catch (error) {
                console.error('Failed to parse rejection info:', error);
            }
        }

        // Load companies
                await loadCompanies();
            } catch (error) {
                console.error('Failed to initialize page:', error);
                setError('Failed to load page data. Please refresh and try again.');
            } finally {
                setIsInitializing(false);
            }
        };

        initializePage();
    }, [searchParams]);

    const loadCompanies = async () => {
        try {
            const companiesData = await companyApi.getAllCompanies();
            setCompanies(companiesData);
        } catch (err) {
            console.error('Failed to load companies:', err);
        }
    };

    const searchCompanies = async (query: string) => {
        if (!query.trim()) {
            loadCompanies();
            return;
        }

        try {
            const results = await companyApi.searchCompanies(query);
            setCompanies(results);
        } catch (err) {
            console.error('Failed to search companies:', err);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        searchCompanies(value);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const handleCompanySelect = (companyName: string) => {
        handleInputChange('companyName', companyName);
        setSearchQuery(companyName);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            setError('No reapplication token available. Please contact support.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!formData.companyName) {
            setError('Please select a company');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const reapplyData = {
                token: token,
                companyName: formData.companyName,
                companyRole: formData.companyRole,
                password: formData.password
            };

            const response = await authApi.reapply(reapplyData);
            
            setSuccess('Reapplication submitted successfully! Please wait for company approval.');
            
            // Clear the stored data
            localStorage.removeItem('reapplicationToken');
            localStorage.removeItem('rejectionInfo');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?message=reapplication-submitted');
            }, 3000);

        } catch (err: any) {
            console.error('Reapplication failed:', err);
            
            // Handle specific backend error responses
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.details) {
                // Handle validation errors with details
                const details = err.response.data.details;
                if (details.companyName) {
                    setError(`Company Error: ${details.companyName}`);
                } else if (details.solution) {
                    setError(`${err.response.data.message}: ${details.solution}`);
                } else {
                    setError(err.response.data.message);
                }
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Reapplication failed. Please try again or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Show loading spinner while initializing
    if (isInitializing) {
        return (
            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
                <div className="max-w-lg w-full mx-auto py-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    // Show error if no token is available
    if (!token) {
        return (
            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
                <div className="max-w-lg w-full mx-auto py-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Access Error</h1>
                    <p className="text-gray-600 mb-4">No reapplication token found. Please contact your company administrator.</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/login')}
                    >
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col justify-center">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <UserPlusIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">2</span>
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Reapply for Access
                </h1>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                    Submit a new application to join a different company and continue your sustainability journey
                </p>
            </div>

            {/* Main Content - Full Width */}
            <div className="w-full max-w-2xl mx-auto">

                {/* Rejection Status Warning */}
                {rejectionInfo && (
                    <div className={`mb-8 p-6 rounded-2xl border-2 ${
                        rejectionInfo.isApproachingBan 
                            ? 'bg-red-50 border-red-200 shadow-lg' 
                            : 'bg-yellow-50 border-yellow-200 shadow-lg'
                    }`}>
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-xl ${
                                rejectionInfo.isApproachingBan 
                                    ? 'bg-red-500' 
                                    : 'bg-yellow-500'
                            } shadow-lg`}>
                                <ShieldExclamationIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold mb-2 ${
                                    rejectionInfo.isApproachingBan ? 'text-red-800' : 'text-amber-800'
                                }`}>
                                    {rejectionInfo.isApproachingBan ? '🚨 FINAL WARNING' : '⚠️ Reapplication Notice'}
                                </h3>
                                <div className={`p-4 rounded-xl mb-3 ${
                                    rejectionInfo.isApproachingBan 
                                        ? 'bg-red-100/50 border border-red-200' 
                                        : 'bg-amber-100/50 border border-amber-200'
                                }`}>
                                    <p className={`text-base font-medium ${
                                        rejectionInfo.isApproachingBan ? 'text-red-700' : 'text-amber-700'
                                    }`}>
                                        You have been rejected <span className="font-bold text-lg">{rejectionInfo.count}</span> time(s). 
                                        <br />
                                        You have <span className="font-bold text-lg text-green-600">{rejectionInfo.remaining}</span> attempt(s) remaining.
                                    </p>
                                </div>
                                {rejectionInfo.isApproachingBan && (
                                    <div className="p-3 bg-red-100 rounded-xl border border-red-300">
                                        <p className="text-red-700 text-sm font-semibold flex items-center">
                                            <span className="mr-2">🔥</span>
                                            If this application is rejected, your account will be permanently banned from the platform.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-800 font-medium">Error</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                        <InformationCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-green-800 font-medium">Success!</h3>
                            <p className="text-green-600 text-sm mt-1">{success}</p>
                        </div>
                    </div>
                )}

                {/* Important Information */}
                <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-green-600 rounded-xl shadow-lg mr-4">
                            <InformationCircleIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-green-800">Important Guidelines</h3>
                    </div>
                    <div className="grid gap-3">
                        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-green-700 font-medium">You must apply to a <span className="font-bold text-green-800">different company</span> than previously</p>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-green-700 font-medium">Set a new password for security purposes</p>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-green-700 font-medium">Ensure you meet the new company's requirements</p>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-green-700 font-medium">Wait for the company owner's approval decision</p>
                        </div>
                    </div>
                </div>

                {/* Reapplication Form */}
                {!success && (
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Details</h2>
                            <p className="text-gray-600">Fill in your new application information</p>
                        </div>
                        {/* Company Selection */}
                        <div className="mb-8">
                            <div className="mb-4">
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Search and Select Company <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Type to search companies..."
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg"
                                        required
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            
                            {companies.length > 0 && searchQuery && (
                                <div className="mt-4 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl bg-white shadow-lg">
                                    {companies.map((company) => (
                                        <button
                                            key={company.id}
                                            type="button"
                                            onClick={() => handleCompanySelect(company.name)}
                                            className="w-full text-left px-4 py-4 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                                        >
                                            <div className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors">
                                                {company.name}
                                            </div>
                                            {company.industry && (
                                                <div className="text-sm text-gray-500 mt-1 flex items-center">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                    {company.industry}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Company Role */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                Company Role
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.companyRole}
                                    onChange={(e) => handleInputChange('companyRole', e.target.value)}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg appearance-none bg-white"
                                    required
                                >
                                    <option value="EMPLOYEE">👤 Employee</option>
                                    <option value="MANAGER">👨‍💼 Manager</option>
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                ℹ️ Note: Owner role requires separate company registration
                            </p>
                        </div>

                        {/* New Password */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="Enter a new password (min. 6 characters)"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                placeholder="Confirm your new password"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                    Submitting Application...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span className="mr-2">🚀</span>
                                    Submit Reapplication
                                </div>
                            )}
                        </button>

                        {/* Back to Login */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center justify-center mx-auto group"
                            >
                                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 